import React from 'react';
import './App.css';

import DraggableContainer from 'draggable-container/dist/';

function App() {
  return (
    <div className="App">
      hi
      <header className="App-header">
        <DraggableContainer>
          <DraggableContainer.Item>{'hello'}</DraggableContainer.Item>
        </DraggableContainer>
      </header>
    </div>
  );
}

export default App;
