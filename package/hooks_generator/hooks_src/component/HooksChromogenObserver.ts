/* eslint-disable */
import React, { useState as reactUseState, useEffect, useRef } from 'react';

import { hooksLedger as ledger } from '../utils/hooks-ledger';
import { hookStyles as styles, generateHooksFile as generateFile } from './hooks-component-utils';
import { recordingState } from '../utils/hooks-store';
/* eslint-enable */

// Export hooksChromogenObserver
export const hooksChromogenObserver: React.FC = () => {
  // Initializing as undefined over null to match React typing for AnchorHTML attributes
  // File will be string
  const [file, setFile] = reactUseState<undefined | string>(undefined);
  // RecordingState is imported from hooks-store
  const [recording, setRecording] = reactUseState<boolean>(recordingState);
  // DevTool will be default false unless user opens up devTool (=> true)
  const [devtool, setDevtool] = reactUseState<boolean>(false);

  // DevTool message handling
  // We want the user to manually toggle between Hooks or Recoil on both DevTool & main app (ADD IN FUNCTIONALITY)
  const receiveMessage = (message: any) => {
    switch (message.data.action) {
      case 'connectChromogen':
        setDevtool(true);
        window.postMessage({ action: 'moduleConnected' }, '*');
        break;
      case 'downloadFile':
        generateFile(setFile);
        break;
      case 'toggleRecord':
        setRecording(!recording);
        window.postMessage({ action: 'setStatus' }, '*');
        break;
      default:
      // Do nothing
    }
  };

  // Add DevTool event listeners
  useEffect(() => {
    window.addEventListener('message', receiveMessage);

    return () => window.removeEventListener('message', receiveMessage);
  });

  // Auto-click download link when a new file is generated (via button click)
  useEffect(() => document.getElementById('chromogen-download')!.click(), [file]);

  // usePrevious custom hook for grabbing the previous state value
  // function usePrevious(value: any) {
  //   // useRef will return a mutable ref object with a current property initialized to the current passed in argument. This object will persist for full lifetime of the component
  //   const ref = useRef();
  //   // Store current value in ref
  //   useEffect(() => {
  //     ref.current = value;
  //   }, [value]); // Only re-run if value changes

  //   return ref.current; // Previous value (happens before update in useEffect)
  // }


  // useEffect to check if tracker[1] was invoked
  useEffect(() => {
    const { transactions } = ledger;
    // For tracker ([state, setState]), write setInterval to check when tracker[0] !== currState (setState is invoked). Stop setInterval once this condition is truthy.

    let setStateTracker = setInterval(() => {

      if (reactUseState() !== transactions.currState) {
        // Increment count by 1
        transactions.count += 1;

        // Push currState to prevState
        transactions.prevState ? transactions.prevState.splice(0, 1, transactions.currState) : transactions.prevState.push(transactions.currState);

        // Replace currState with value at tracker[0] (user input)
        transactions.currState.splice(0, 1, reactUseState())

        // Stop interval
        clearInterval(setStateTracker);
      }
    }, 1000);
  });

  // User imports hooksChromogenObserver to their app
  // Button download: onClick for generateHooksFile
  // Button record: onClick for setRecording
  return (
      !devtool && (
        <div style={styles.divStyle}>
          <button
            aria-label="capture test"
            id="chromogen-generate-file"
            style={{ ...styles.hooksButtonStyle, backgroundColor: '#12967a' }}
            type="button"
            onClick={() => generateFile(setFile, storeMap)}
          />
          <button
            aria-label={recording ? 'pause' : 'record'}
            id="chromogen-toggle-record"
            style={{ ...styles.buttonStyle, backgroundColor: recording ? '#d44b5a' : '#fce3a3' }}
            type="button"
            onClick={() => {
              setRecording(!recording);
            }}
          />
        </div>
      )
    }
    <a
      download="chromogen.test.js"
      href={file}
      id="chromogen-download"
      style={{ display: 'none' }}
    >
      Download Test
    </a>
  );
};
