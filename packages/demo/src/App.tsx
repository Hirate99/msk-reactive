import React from 'react';
import './App.css';

import DraggableContainer from 'draggable-container';

const Backgrounds = ['red', 'blue', 'grey'];

const DraggableItems = new Array(12).fill(null).map((item, idx) => {
  return {
    title: `hello, item-${idx}`,
    style: {
      background: Backgrounds[idx % Backgrounds.length],
      width: '100%',
      height: '100%',
    },
  };
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <DraggableContainer
          className={'item-container'}
          itemWidth={200}
          itemHeight={200}
        >
          {DraggableItems.map((item, idx) => (
            <DraggableContainer.Item key={`${idx}`}>
              <div style={item.style}>{item.title}</div>
            </DraggableContainer.Item>
          ))}
        </DraggableContainer>
      </header>
    </div>
  );
}

export default App;
