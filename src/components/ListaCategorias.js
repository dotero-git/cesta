import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import ArticuloForm from './ArticuloForm';
import './Accordion.css';
import { TiEdit, TiHome, TiShoppingCart,TiTrash} from "react-icons/ti";


const ListaCategorias = ({ categorias, articulos, onDataUpdated }) => {
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [editingArticulo, setEditingArticulo] = useState(null);
  const [loading, setLoading] = useState({});
  const [categoriaAbierta, setCategoriaAbierta] = useState(4);

  const Accordion = ({ categoria, id, abierto, onToggle, children }) => {
      return (
        <div className="accordion">
          <div className="grid gap-1 accordion-title" >
            <div className="flex justify-between 
                                items-center p-2 bg-gradient-to-r from-indigo-50 
                                to-purple-50 hover:shadow-md transition-all">
              <div>{categoria.dncategoria}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCategoria(categoria)}
                  className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                  title="Editar categoría"
                >
                  <TiEdit/>
                </button>
                <button
                      onClick={() => handleDeleteCategoria(categoria.cdcategoria)}
                      disabled={loading[categoria.cdcategoria]}
                      className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                      title="Eliminar categoría"
                >
                  {loading[categoria.cdcategoria] ? '⏳' : <TiTrash/>}
                </button>
                <div style={{ marginLeft: "20px" }} onClick={onToggle}><span>{open ? "▲" : "▼"}</span></div>
              </div>   
            </div>  
          </div>
          {abierto && <div className="accordion-content">{children}</div>}
        </div>
      );
  };

  // Agrupar artículos por categoría
  const articulosPorCategoria = {};
  categorias.sort((a,b)=> a.dncategoria < b.dncategoria ? -1 : 1);
  categorias.forEach(cat => {
    articulosPorCategoria[cat.cdcategoria] = articulos.filter(a => a.cdcategoria === cat.cdcategoria);
    articulosPorCategoria[cat.cdcategoria].sort((a,b)=> a.dnarticulo < b.dnarticulo ? -1 : 1);
  });
  const handleDeleteCategoria = async (cdcategoria) => {
    if (articulosPorCategoria[cdcategoria].length>0) {
        alert("No se puede eliminar la categoría. Tiene artículos definidos");
        return;
    }
    if (!confirm('¿Eliminar esta categoría?')) 
      return;
    
    setLoading(prev => ({ ...prev, [cdcategoria]: true }));
    const { error } = await supabase.from('CATEGORIAS').delete().eq('cdcategoria', cdcategoria);
    
    if (!error) {
      categorias.map((categoria, index) => {
          if (categoria.cdcategoria == cdcategoria) {
              categorias.splice(index, 1);
          }
       });
      onDataUpdated();
    }
    setLoading(prev => ({ ...prev, [cdcategoria]: false }));
  };

  const handleEditCategoria = (categoria) => {
    setEditingCategoria(categoria);
  };

  const handleSaveCategoriaEdit = async (categoria, nuevoNombre) => {
    const { error } = await supabase
      .from('CATEGORIAS')
      .update({ dncategoria: nuevoNombre.trim() })
      .eq('cdcategoria', categoria.cdcategoria);
    
    if (!error) {
      categoria.dncategoria = nuevoNombre.trim();
      setEditingCategoria(null);
      onDataUpdated();
    }
  };
  const onArticuloAdded = async (articulo)=> {
      articulos.push(articulo);
      onDataUpdated();
  }

  const handleEditArticulo = (articulo) => {
    setEditingArticulo(articulo);
  };

  const handleDeleteArticulo = async (cdarticulo) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    
    setLoading(prev => ({ ...prev, [cdarticulo]: true }));
    const { error } = await supabase.from('ARTICULOS').delete().eq('cdarticulo', cdarticulo);
    
    if (!error) {
       articulos.map((articulo, index) => {
          if (articulo.cdarticulo == cdarticulo) {
              articulos.splice(index, 1);
          }
       });
       onDataUpdated();
    }
    setLoading(prev => ({ ...prev, [cdarticulo]: false }));
  };

  const handleSaveArticuloEdit = async (articulo, nuevoNombre) => {
    const { error } = await supabase
      .from('ARTICULOS')
      .update({ dnarticulo: nuevoNombre.trim() })
      .eq('cdarticulo', articulo.cdarticulo);
    
    if (!error) {
      articulo.dnarticulo = nuevoNombre.trim();
      setEditingArticulo(null);
      onDataUpdated();
    }
  };
  const handleSaveArticuloEstado = async (articulo, nuevoEstado) => {
    const { error } = await supabase
      .from('ARTICULOS')
      .update({ estado: nuevoEstado })
      .eq('cdarticulo', articulo.cdarticulo );
    
    if (!error) {
      articulo.estado = nuevoEstado;
      setEditingArticulo(null);
      onDataUpdated();
    }
  };

  if (categorias.length === 0) {
    return (
      <div className="text-center py-16 bg-white/60 backdrop-blur-md p-12 border border-dashed border-gray-300">
        <div className="text-6xl mb-4">🛒</div>
        <div className="text-2xl font-bold text-gray-700 mb-2">¡Empieza tu lista!</div>
        <p className="text-lg text-gray-500">Añade tu primera categoría arriba</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categorias.map((categoria) => {
        const arts = articulosPorCategoria[categoria.cdcategoria] || [];
        return (
          <Accordion categoria={categoria} 
                     key={categoria.cdcategoria}
                     id={categoria.cdcategoria}
                     abierto={categoriaAbierta === categoria.cdcategoria}
                     onToggle={() => {
                         if (categoriaAbierta != categoria.cdcategoria) {
                            setCategoriaAbierta(categoria.cdcategoria);       
                         }
                        else
                            setCategoriaAbierta(null);
                    }}
          >
            <div key={categoria.cdcategoria}>
            {/* Header de Categoría */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              {editingCategoria?.cdcategoria === categoria.cdcategoria ? (
                  <div className="flex gap-3 items-center flex-1">
                    <input
                      type="text"
                      defaultValue={editingCategoria.dncategoria}
                      onBlur={(e) => handleSaveCategoriaEdit(editingCategoria, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveCategoriaEdit(editingCategoria, e.target.value);
                        }
                      }}
                      className="flex-1 p-3 border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xl font-bold"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingCategoria(null)}
                      className="text-gray-500 hover:text-gray-700 p-2"
                    >
                      ✕
                    </button>
                  </div>
              ) : (<></>)}
            </div>

            {/* Lista de artículos */}
            {arts.length > 0 ? (
              <div className="grid gap-1">
                {arts.map((articulo) => (
                  <div key={articulo.cdarticulo} 
                     className="flex justify-between 
                                items-center p-2 bg-gradient-to-r from-indigo-50 
                                to-purple-50 hover:shadow-md transition-all">
                    {editingArticulo?.cdarticulo === articulo.cdarticulo ? (
                      <div className="flex gap-3 items-center flex-1">
                        <input
                          type="text"
                          defaultValue={editingArticulo.dnarticulo}
                          onBlur={(e) => handleSaveArticuloEdit(articulo.cdarticulo, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveArticuloEdit(articulo.cdarticulo, e.target.value);
                            }
                          }}
                          className="flex-1 p-3 border  focus:ring-2 focus:ring-indigo-200 text-lg"
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingArticulo(null)}
                          className="text-gray-500 hover:text-gray-700 p-2"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        {articulo.estado==0 ? 
                          (<TiShoppingCart color="red"
                                                onClick={(e) => handleSaveArticuloEstado(articulo, 1)}
                                                onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSaveArticuloEstado(articulo, 1);
                                                             }
                                                 }}
                          />) : 
                          (<TiHome color="greend"
                                onClick={(e) => handleSaveArticuloEstado(articulo, 0)}
                                onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSaveArticuloEstado(articulo, 0);
                                              }
                                  }}
                            />) 
                        }
                        <span className="text-lg font-medium text-gray-800 flex-1">{articulo.dnarticulo}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditArticulo(articulo)}
                            className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                            title="Editar artículo"
                          >
                            <TiEdit></TiEdit>
                          </button>
                          <button
                            onClick={() => handleDeleteArticulo(articulo.cdarticulo)}
                            disabled={loading[articulo.cdarticulo]}
                            className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                            title="Eliminar artículo"
                          >
                            {loading[articulo.cdarticulo] ? '⏳' : <TiTrash/>}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50  mt-6">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 font-normal">No hay artículos en esta categoría</p>
              </div>
            )}

            {/* Formulario añadir artículo */}
            <ArticuloForm 
              cdcategoria={categoria.cdcategoria}
              dncategoria={categoria.dncategoria}
              onArticuloAdded={onArticuloAdded}
            />
            </div>
          </Accordion>
        );
      })}
    </div>
  );
};

export default ListaCategorias;
