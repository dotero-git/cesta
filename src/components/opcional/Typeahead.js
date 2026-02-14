import React, { useState, useEffect } from 'react';
import './Typeahead.css';

const Typeahead = ({ articulos }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = (query) => {
    return new Promise((resolve) => {
        setTimeout(() => {
        var suggestions = articulos.filter(a => a.dnarticulo.toUpperCase().indexOf(query.toUpperCase())>=0); //.map(a=>a.dnarticulo);
        resolve(suggestions);
        }, 500);
    });
  };
   const cambiarEstado = async (articulo) => {
      console.log("Selección: "+articulo.dnarticulo);
      setSuggestions([]);
   }; 
  const SuggestionsList = ({ suggestions }) => {
  return (
    <ul className="suggestions-list" onMouseOut={(e)=> setSuggestions([])} >
      {suggestions.map((suggestion, index) => (
        <li key={index}  onClick={(e) => cambiarEstado(suggestion)}>
          {suggestion.dnarticulo}
        </li>
      ))}
    </ul>
    );
  };

  useEffect(() => {
        if (inputValue) {
            fetchSuggestions(inputValue).then((newSuggestions) => {
            setSuggestions(newSuggestions);
            });
        } else {
            setSuggestions([]);
        }
   }, [inputValue]); 
  return (
    <div className="typeahead-container">
        <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Buscar artículo..."
        />
        {suggestions.length > 0 && (
            <SuggestionsList suggestions={suggestions} />
        )}
    </div>
  )
};

export default Typeahead;