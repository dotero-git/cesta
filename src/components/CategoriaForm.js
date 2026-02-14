import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const CategoriaForm = ({ onCategoriaUpdated, onCategoriaAdded }) => {
  const [dncategoria, setDncategoria] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dncategoria.trim()) return;

    setLoading(true);
    let error;
    
    if (editingId) {
      // Editar categoría existente
      ({ error } = await supabase
        .from('CATEGORIAS')
        .update({ dncategoria: dncategoria.trim() })
        .eq('cdcategoria', editingId));
      setEditingId(null);
      if (!error) {
         onCategoriaUpdated();
      }  
    } 
    else {
      // Nueva categoría
       const { data:insertado, error: errorInsert } = await supabase
        .from('CATEGORIAS')
        .insert({ dncategoria: dncategoria.trim() })
        .select('cdcategoria');
        
        if (!errorInsert) {
          setDncategoria('');
          const categoria = {cdcategoria: insertado[0].cdcategoria, 
                              dncategoria: dncategoria.trim()};
          onCategoriaAdded(categoria);
        }
    }

    setLoading(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 shadow-2xl border border-white/50 mb-10"
         style={{width: "90%"}}>
      <div className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
        Nueva Categoría
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-gray-50 ">
         <input 
          type="text"
          value={dncategoria}
          onChange={(e) => setDncategoria(e.target.value)}
          placeholder="Ej: Frutas, Lácteos, Panadería..."
          className="w-full p-4 border 
                     border-gray-200  
                     focus:border-green-500 
                     focus:ring-2 focus:ring-green-200 transition-all 
                     text-lg bg-white"
          disabled={loading}
        />
        <button 
        type="submit" 
        disabled={loading || !dncategoria.trim()}
        className="bg-gradient-to-r 
                  from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white 
                  px-8  font-semibold text-lg shadow-lg hover:shadow-xl 
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
         {loading ? '⏳' : '➕'}
        </button>
      </form>
    </div>
  );
};

export default CategoriaForm;
