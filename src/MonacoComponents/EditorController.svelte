<script>
  import Monaco from './Monaco.svelte';
  import DirectoryData from '../Utilities/DirectoryStore';

  const { remote, ipcRenderer } = require('electron');
  const fs = require('fs');
  const path = require('path');
  const currentWindow = remote.getCurrentWindow();
  
  export let tabs = [];
  export let activeTabValue = 1;
  let activeEditor = 1;

  let value = ['This', 'is', 'SvelteStorm'];
  let language = 'html';
  let [filePath, fileName, readData] = ['', '', ''];
  let title = 'Svelte Storm';
  let count = 0;

  function addTab(file) {
    console.log(file.ext)
    count = count + 1;
    let duplicate = false;
    tabs.map((tab) => {
      if (tab.filePath === file.filePath) {
        duplicate = true;
        count = count-1;
      }
    })
    file.tabId = count;
    if (!duplicate) {
      tabs = [ 
        ...tabs,
        file
      ];
    }
  };

  function deleteTab(targetId) {
    const filtered = tabs.filter((t) => t.tabId != targetId);
    tabs = filtered;
    activeEditor = 1;
    activeTabValue = 1;
  }

  const handleClick = (tab) => () => {
    activeTabValue = tab.tabId;
    activeEditor = activeTabValue;
    currentWindow.setTitle(tab.fileName);
  }
  
  const getLanguage = (lang) => {
      switch (lang) {
        case 'js':
          return 'javascript';
        case 'jsx':
          return 'react';
        case 'ts':
          return 'typescript';
        case 'tsx':
          return 'typescript';
        case 'json':
          return 'json';
        case 'css':
          return 'css';
        case 'html':
          return 'html';
        case 'md':
          return 'markdown';
        case 'svelte':
          return 'html';
        case 'yaml':
          return 'yaml';
        default:
          return lang;
      }
  }

  ipcRenderer.on('file-opened', function (evt, file, content) {
      const newTab = {}
      newTab.editorValue = content.split(/\r?\n/);
      filePath = (file);
      fileName = file.slice().split('/').pop();
      language = file.slice().split('.').pop();
      newTab.ext = language;
      newTab.editorLang = getLanguage(language);
      newTab.filePath = filePath;
      newTab.fileName = fileName;
      addTab(newTab);
      if (file) { title = `${path.basename(file)} - ${title}`; }
  });

  DirectoryData.subscribe(data => {
      if (data.fileRead) {
        readData = fs.readFileSync(data.openFilePath).toString();
        value = readData.split(/\r?\n/);
        fileName = data.openFilePath.slice().split('/').pop();
        language = path.basename(data.openFilePath).split('.').pop();
        if (data.openFilePath) { title = `${path.basename(data.openFilePath)} - ${title}`; }
        currentWindow.setTitle(title);
        addTab(value, language, fileName, data.openFilePath, language);
      }
  });

</script>

  <ul>
    {#each tabs as tab}
    <li class={activeTabValue === tab.tabId ? 'active' : ''}>
      <span class="tab-span"
        on:click={handleClick(tab)}
      >
        <img src="/Users/samuelfilip/keepItSvelte/SvelteStorm/src/icons/file_type_{tab.ext}.svg" 
          alt={''}
        />
        {tab.fileName}
        <span
          class="delete-button" 
          value={tab.tabId}
          on:click={(value) => deleteTab(tab.tabId)}
        >
          &times
        </span>
      </span>
    </li>
    {/each}
  </ul>
  
  {#if tabs.length}
    <div class="editor-body">
        <Monaco
          class="childClass current"
          bind:value={tabs[(activeEditor-1)].editorValue}
          bind:language={tabs[(activeEditor-1)].editorLang}
          bind:filePath={tabs[(activeEditor-1)].filePath} 
        />
    </div>
  {/if}

<style>

  .editor-body {
    width: 100%;
    height: 100vh;
    overflow: scroll;
  }

  ul {
    display: flex;
    flex-direction: row;
    overflow: scroll;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
    border-radius: 5px;
  }

	li {
		margin-bottom: -1px;
    background-color: black;
    color: #fff;
	}

  .tab-span {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: flex;
    flex-direction: row;
    padding: 0 1rem;
    cursor: pointer;
    font-size: 1em;
  }

  .tab-span:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  li.active > span {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  img {
    height: 1em;
    background-color: inherit;
    margin-top: 3px;
    /* margin-bottom: 0; */
  }

  .delete-button {
    margin-left: 5px;
    border-right: black;
    border-left: black;
  }

</style>