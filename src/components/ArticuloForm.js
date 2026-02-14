import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ArticuloForm = ({ cdcategoria, dncategoria, onArticuloAdded }) => {
  const [dnarticulo, setDnarticulo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dnarticulo.trim()) 
      return;
    const { data: existentes, error: errorSelect }= await supabase
        .from('ARTICULOS')
        .select()
        .ilike('dnarticulo', '%'+dnarticulo.trim()+'%');
    if (!errorSelect) {
      if (existentes!==undefined && existentes.length>0) {
        var mensaje = "Ya están registrados artículos con denominación parecida: \r\n";
        existentes.map(articulo => {
            mensaje+="\r\n"+articulo.dnarticulo;
        });
        mensaje+="\r\n¿Grabamos el nuevo artículo?"
        if (!confirm(mensaje)) 
           return
      }
      setLoading(true);
      const { data: insertados, error: errorInsert } = await supabase
        .from('ARTICULOS')
        .insert({ 
          dnarticulo: dnarticulo.trim(), 
          cdcategoria: cdcategoria 
        })
        .select('cdarticulo');

      if (!errorInsert) {
        setDnarticulo('');
        const articulo = {cdarticulo: insertados[0].cdarticulo, 
                          dnarticulo: dnarticulo.trim(), 
                          cdcategoria: cdcategoria,
                          estado: 0, //Por defecto, sin comprar...
                          label: dnarticulo.trim()};
        onArticuloAdded(articulo);
      }
      else {
          alert("Error al agregar el artículo: "+error.message);
      }
      setLoading(false);
    }  
    else {
      alert("Error al consultar artículos parecidos: "+errorSelect.message);
    }  

      
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-gray-50 ">
      <div className="flex-1">
        <input style={{width: "100%"}}
          type="text"
          value={dnarticulo}
          onChange={(e) => setDnarticulo(e.target.value)}
          placeholder={`Añadir artículo a ${dncategoria}...`}
          className="w-full p-4 border 
                     border-gray-200  
                     focus:border-green-500 
                     focus:ring-2 focus:ring-green-200 transition-all 
                     text-lg bg-white"
          disabled={loading}
        />
      </div>
      <button 
        type="submit" 
        disabled={loading || !dnarticulo.trim()}
        className="bg-gradient-to-r 
                  from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white 
                  px-8  font-semibold text-lg shadow-lg hover:shadow-xl 
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? '⏳' : '🛒'}
      </button>
    </form>
  );
};

export default ArticuloForm;
