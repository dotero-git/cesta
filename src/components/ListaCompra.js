import React, { useState, useLayoutEffect } from 'react';
import { supabase } from '../supabaseClient';
import { TiSortAlphabetically, TiShoppingCart, TiHome} from "react-icons/ti";

const ListaCompra = ({ categorias, articulos, tipoOrden, onDataUpdated }) => {
  const [editingArticulo, setEditingArticulo] = useState(null);
  const [loading, setLoading] = useState({});


  let articulosCompra = articulos.filter(a => a.estado == 0);
  if (tipoOrden == 'categoria') {
      articulosCompra.sort((a,b)=> a.dnarticulo < b.dnarticulo ? -1 : 1);
  }
  else {
      articulosCompra.sort((a,b)=> {
        if (a.cdcategoria == b.cdcategoria) {
           return a.dnarticulo < b.dnarticulo ? -1 : 1;
        }
        else
          return a.cdcategoria < b.cdcategoria ? -1 : 1
      });
  }

  const handleEditArticulo = (articulo) => {
    setEditingArticulo(articulo);
  };

  const handleSaveArticuloEdit = async (cdarticulo, nuevoNombre) => {
    const { error } = await supabase
      .from('ARTICULOS')
      .update({ dnarticulo: nuevoNombre.trim() })
      .eq('cdarticulo', cdarticulo);
    
    if (!error) {
      setEditingArticulo(null);
      onDataUpdated();
    }
  };
  const handleSaveArticuloEstado = async (articulo) => {
    const { error } = await supabase
      .from('ARTICULOS')
      .update({ estado: 1 })  //Comprado
      .eq('cdarticulo', articulo.cdarticulo );
    
    if (!error) {
      articulo.estado = 1;
      setEditingArticulo(null);
      onDataUpdated();
    }
  };

  
  return (
     <ul className="two-col">
      {
        articulosCompra.map((articulo) => (
                <li>
                   <TiShoppingCart color="red"
                        onClick={(e) => handleSaveArticuloEstado(articulo)}
                        onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveArticuloEstado(articulo);
                                     }
                         }}
                  />
                  <span className="text-lg font-medium text-gray-800 flex-1">{articulo.dnarticulo}</span>
                </li>
         ))
      }
    </ul>     
   );
};
export default ListaCompra;
