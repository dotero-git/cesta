import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth  from './Auth';

import CategoriaForm from './components/CategoriaForm';
import ListaCategorias from './components/ListaCategorias';
import ListaCompra from './components/ListaCompra';
import Typeahead from './components/Typeahead';
import { TiShoppingCart, TiSortAlphabetically,TiTag, TiRefresh} from "react-icons/ti";

function App() {
  const [categorias, setCategorias] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [tipoOrden, setTipoOrden] = useState('alfabetico');
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        fetchData();
      } else {
        setSession(null)
      }
    })
  }, [])

  const handleMostrarCategorias = (mostrarCategorias) => {
    setMostrarCategorias(!mostrarCategorias);
  };
  const handleModificacionDatos = () => {
    setArticulos([...articulos]);
    setCategorias([...categorias]);
  };

  const fetchData = async () => {
    setLoading(true);
    const [categoriasRes, articulosRes] = await Promise.all([
      supabase.from('CATEGORIAS').select('*'),
      supabase.from('ARTICULOS').select('*')
    ]);
    articulosRes.data.map(articulo => articulo.label = articulo.dnarticulo)
    setCategorias(categoriasRes.data || []);
    setArticulos(articulosRes.data || []);
    setLoading(false);
  };
  const handleArticuloSeleccionado = async (articulo) => {
    const { error } = await supabase
      .from('ARTICULOS')
      .update({ estado: 0 })
      .eq('cdarticulo', articulo.cdarticulo );
    
    if (!error) {
      fetchData();
    }
  };
  const handleNuevaCategoria = async (categoria)=> {
      categorias.push(categoria);
      handleModificacionDatos();
  }

  if (session && loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-xl">Cargando Cesta...</div>
    </div>;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    {
      !session ? (
          <Auth />
      ) : 
      (
          <div className="container mx-auto px-6 ">
            <div className="grid gap-1" style={{ borderBottom: "1px solid",marginBottom: "10px"}}>
              <div className="flex justify-between 
                                    items-center p-2 bg-gradient-to-r from-indigo-50 
                                    to-purple-50 hover:shadow-md transition-all">
                  <div style={{ marginBottom: "6px", verticalAlign: "middle"}}
                      className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <TiShoppingCart style={{ marginTop: "4px"}}/> Lista de la compra
                  </div>
                  <div className="flex gap-2">
                    <button style={{ fontSize: "1.2rem"}}
                        onClick={() => {
                            if (tipoOrden == 'categoria') {
                                setTipoOrden('alfabetico');       
                            }
                            else
                                setTipoOrden('categoria');
                          }}
                        className="hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                        title="Refrescar datos"
                    >
                        <TiSortAlphabetically/>
                    </button>          
                    
                    <button style={{ fontSize: "1.2rem"}}
                        onClick={() => fetchData()}
                        className="hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                        title="Refrescar datos"
                    >
                        <TiRefresh/>
                    </button>          
                    <button style={{ fontSize: "1.2rem"}}
                        onClick={() => handleMostrarCategorias(mostrarCategorias)}
                        className="hover:text-indigo-700 p-2 hover:bg-indigo-100 rounded-lg transition-all"
                        title="Mostrar categorías"
                    >
                        <TiTag></TiTag>
                    </button>          
                  </div>
              </div>           
            </div>
            <ListaCompra
              articulos={articulos}
              tipoOrden={tipoOrden}
              onDataUpdated={fetchData}
            />  
            <Typeahead
              options={articulos}
              placeholder="Buscar un artículo…"
              onSelect={(opt) => handleArticuloSeleccionado(opt)}
            />
            {mostrarCategorias && (
              <>
              <ListaCategorias  
                categorias={categorias}
                articulos={articulos}
                onDataUpdated={handleModificacionDatos}
              /> 
              <CategoriaForm onCategoriaAdded={handleNuevaCategoria} 
                            onCategoriaUpdated={handleModificacionDatos}/>
              </>
            )}  
          </div>
      ) 
    }
    </div>
  );
}

export default App;
