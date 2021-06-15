<script>
  import {  afterUpdate, onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import loader from '@monaco-editor/loader';
  const fs = require('fs');
  const { ipcRenderer } = require('electron');
  const path = require('path')

  function ensureFirstBackSlash(str) {
    return str.length > 0 && str.charAt(0) !== '/'
        ? '/' + str
        : str;
  }

  function uriFromPath(_path) {
      const pathName = path.resolve(_path).replace(/\\/g, '/');
      return encodeURI('file://' + ensureFirstBackSlash(pathName));
  }

  loader.config({ paths: { vs: uriFromPath(
      path.join(__dirname, '../node_modules/monaco-editor/min/vs')
    )} 
  });

  export let value;
  export let language;
  export let filePath;

  let messageObj;
  let monEditor;
  let containerElt;

  onMount(() => {
      loader.init().then(monaco => {
        monEditor = monaco.editor.create(containerElt, {
        value: value.join('\n'),
        language: language,
        theme: 'vs-dark',
        wordWrap: 'on',
        fontSize: "16px",
      })
    })
  })

	afterUpdate(() => {
    if (monEditor) {
        fs.readFile(filePath, 'utf8', (err, res) => {
          if (!err) {
            monEditor.setModel(monaco.editor.createModel(res, language));
          }
        })
        monEditor.onDidChangeModelContent(() => {
          console.log(monEditor.getValue())
        })
      }
	});
  
  ipcRenderer.on('save-markdown',  function () {
    messageObj = {content : monEditor.getValue(), file : filePath }
    ipcRenderer.send('synchronous-message', messageObj)
  });

</script>

<svelte:head />
<div class={$$props.class} bind:this={containerElt} />

  
