// App.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, DollarSign, Loader2, Zap, Trophy, HelpCircle, ListFilter, ArrowDownWideNarrow, ArrowLeft, ArrowRight, Info, Save, List, Home, BookOpen } from 'lucide-react';
import { Pokemon, UserSetting, DBStatus, AppAlert, AlertType, PokemonRarity, PIKACHU_IMAGE_URL, SortOrder, ACCUMULATED_SALE_PROFIT_KEY, SessionScore, View } from './types';
import { openDB, addPokemon, getAllPokemon, deletePokemon, getUserSetting, putUserSetting, addSessionScore, getTopSessionScores } from './services/indexedDbService';
import { generatePokemon, POKEMON_RARITY_DETAILS, RARITY_SALE_VALUES } from './services/pokemonApiService';
import Button from './components/Button';
import Modal from './components/Modal';

const INITIAL_TOKENS = 100;
const GENERATION_COST = 10;

function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [tokens, setTokens] = useState<number>(0);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [accumulatedSaleProfit, setAccumulatedSaleProfit] = useState<number>(0);
  const [dbStatus, setDbStatus] = useState<DBStatus>(DBStatus.INITIALIZING);
  const [alert, setAlert] = useState<AppAlert>({ isOpen: false, message: '', type: AlertType.INFO, title: '' });
  const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);
  const [loadingSell, setLoadingSell] = useState<number | null>(null);
  const [showRarityGuideModal, setShowRarityGuideModal] = useState<boolean>(false);
  const [isTokenPulsing, setIsTokenPulsing] = useState<boolean>(false);
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<PokemonRarity | 'All'>('All');
  const [selectedSortOrder, setSelectedSortOrder] = useState<SortOrder>(SortOrder.DATE_DESC);
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 6; 

  const [selectedPokemonForDetails, setSelectedPokemonForDetails] = useState<Pokemon | null>(null);
  const [showPokemonDetailsModal, setShowPokemonDetailsModal] = useState<boolean>(false);
  const [topScores, setTopScores] = useState<SessionScore[]>([]);
  const [sessionNickname, setSessionNickname] = useState<string>('');

  const showAlert = (message: string, type: AlertType, title?: string) => {
    setAlert({ isOpen: true, message, type, title: title || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() });
  };

  const closeAlert = () => setAlert({ ...alert, isOpen: false });

  const loadTopScores = useCallback(async () => {
    try {
      const fetchedTopScores = await getTopSessionScores(10);
      setTopScores(fetchedTopScores);
    } catch (error: any) {
      console.error("Error loading top scores:", error);
    }
  }, []);

  const loadAppData = useCallback(async () => {
    try {
      setDbStatus(DBStatus.INITIALIZING);
      await openDB();

      const fetchedPokemons = await getAllPokemon();
      setPokemons(fetchedPokemons);

      let userTokens = await getUserSetting('tokens');
      if (!userTokens) {
        userTokens = { key: 'tokens', value: INITIAL_TOKENS };
        await putUserSetting(userTokens);
      }
      setTokens(userTokens.value as number);

      let userAccumulatedSaleProfit = await getUserSetting(ACCUMULATED_SALE_PROFIT_KEY);
      if (!userAccumulatedSaleProfit) {
        userAccumulatedSaleProfit = { key: ACCUMULATED_SALE_PROFIT_KEY, value: 0 };
        await putUserSetting(userAccumulatedSaleProfit);
      }
      setAccumulatedSaleProfit(userAccumulatedSaleProfit.value as number);

      await loadTopScores();
      setDbStatus(DBStatus.READY);
    } catch (error: any) {
      setDbStatus(DBStatus.ERROR);
      showAlert(`Failed to load data: ${error.message}`, AlertType.ERROR);
    }
  }, [loadTopScores]);

  useEffect(() => { loadAppData(); }, [loadAppData]);

  useEffect(() => {
    const currentCollectionScore = pokemons.reduce((sum, pokemon) => sum + pokemon.score, 0);
    setOverallScore(currentCollectionScore + accumulatedSaleProfit);
  }, [pokemons, accumulatedSaleProfit]);

  const updateTokens = useCallback(async (amount: number) => {
    const newTokens = tokens + amount;
    await putUserSetting({ key: 'tokens', value: newTokens });
    setTokens(newTokens);
    setIsTokenPulsing(true);
    setTimeout(() => setIsTokenPulsing(false), 500);
  }, [tokens]);

  const handleGeneratePokemon = async () => {
    if (tokens < GENERATION_COST) {
      showAlert(`Jetons insuffisants (${tokens}/${GENERATION_COST}).`, AlertType.WARNING);
      return;
    }
    setLoadingGenerate(true);
    try {
      await updateTokens(-GENERATION_COST);
      const newPokemonData = await generatePokemon();
      const addedPokemon = await addPokemon(newPokemonData);
      setPokemons(prev => [...prev, addedPokemon]);
      showAlert(`${addedPokemon.name} (${addedPokemon.rarity}) a été généré !`, AlertType.SUCCESS);
    } catch (error: any) {
      showAlert(`Erreur: ${error.message}`, AlertType.ERROR);
    } finally { setLoadingGenerate(false); }
  };

  const handleSellPokemon = async (pokemonToSell: Pokemon) => {
    setLoadingSell(pokemonToSell.id);
    try {
      await deletePokemon(pokemonToSell.id);
      setPokemons(prev => prev.filter(p => p.id !== pokemonToSell.id));
      const profit = RARITY_SALE_VALUES[pokemonToSell.rarity];
      await updateTokens(profit);
      setAccumulatedSaleProfit(prev => {
        const next = prev + profit;
        putUserSetting({ key: ACCUMULATED_SALE_PROFIT_KEY, value: next });
        return next;
      });
      showAlert(`Vendu pour ${profit} jetons !`, AlertType.SUCCESS);
    } catch (error: any) {
      showAlert(`Erreur: ${error.message}`, AlertType.ERROR);
    } finally { setLoadingSell(null); }
  };

  const handleSaveSessionScore = async () => {
    if (overallScore <= 0) return;
    try {
      await addSessionScore({ score: overallScore, date: new Date().toISOString(), nickname: sessionNickname.trim() || undefined });
      await loadTopScores();
      setSessionNickname('');
      showAlert('Score sauvegardé !', AlertType.SUCCESS);
    } catch (error: any) {
      showAlert(`Erreur: ${error.message}`, AlertType.ERROR);
    }
  };

  const getRarityColorClass = (rarity: PokemonRarity) => {
    switch (rarity) {
      case PokemonRarity.COMMON: return 'text-gray-500';
      case PokemonRarity.UNCOMMON: return 'text-green-600';
      case PokemonRarity.RARE: return 'text-blue-600';
      case PokemonRarity.EPIC: return 'text-purple-600';
      case PokemonRarity.LEGENDARY: return 'text-yellow-600';
      default: return 'text-gray-700';
    }
  };

  // Fixed Error on line 156 by completing the sort logic and useMemo block
  const filteredAndSortedPokemons = useMemo(() => {
    let result = pokemons;
    if (selectedRarityFilter !== 'All') {
      result = result.filter(p => p.rarity === selectedRarityFilter);
    }
    
    return [...result].sort((a, b) => {
      switch (selectedSortOrder) {
        case SortOrder.DATE_ASC:
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case SortOrder.DATE_DESC:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case SortOrder.SCORE_ASC:
          return a.score - b.score;
        case SortOrder.SCORE_DESC:
          return b.score - a.score;
        default:
          return 0;
      }
    });
  }, [pokemons, selectedRarityFilter, selectedSortOrder]);

  const paginatedPokemons = useMemo(() => {
    const startIndex = (currentPage - 1) * pokemonsPerPage;
    return filteredAndSortedPokemons.slice(startIndex, startIndex + pokemonsPerPage);
  }, [filteredAndSortedPokemons, currentPage, pokemonsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedPokemons.length / pokemonsPerPage);

  if (dbStatus === DBStatus.INITIALIZING) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Initialisation de l'application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">PokeGen</h1>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className={`flex items-center space-x-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 transition-transform duration-500 ${isTokenPulsing ? 'scale-110' : ''}`}>
              <DollarSign className="h-4 w-4 text-amber-600" />
              <span className="font-bold text-amber-700">{tokens}</span>
              <span className="text-xs text-amber-500 font-medium uppercase tracking-wider">Jetons</span>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
              <Trophy className="h-4 w-4 text-indigo-600" />
              <span className="font-bold text-indigo-700">{overallScore}</span>
              <span className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === View.HOME && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in pt-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src={PIKACHU_IMAGE_URL} 
                alt="Pikachu" 
                className="relative h-48 w-48 object-contain drop-shadow-2xl animate-float"
              />
            </div>
            
            <div className="text-center space-y-4 max-w-lg">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Générateur de Pokémon</h2>
              <p className="text-gray-600 text-lg">Dépensez des jetons pour découvrir des Pokémon rares et construire votre collection légendaire.</p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                Icon={Plus} 
                onClick={handleGeneratePokemon} 
                loading={loadingGenerate}
                className="w-full sm:w-auto shadow-lg shadow-indigo-200"
              >
                Générer ({GENERATION_COST})
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                Icon={HelpCircle} 
                onClick={() => setShowRarityGuideModal(true)}
                className="w-full sm:w-auto"
              >
                Guide des raretés
              </Button>
            </div>
          </div>
        )}

        {currentView === View.COLLECTION && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <ListFilter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtre:</span>
                <select 
                  value={selectedRarityFilter} 
                  onChange={(e) => { setSelectedRarityFilter(e.target.value as any); setCurrentPage(1); }}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="All">Toutes les raretés</option>
                  {Object.values(PokemonRarity).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <ArrowDownWideNarrow className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Trier par:</span>
                <select 
                  value={selectedSortOrder} 
                  onChange={(e) => setSelectedSortOrder(e.target.value as SortOrder)}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.values(SortOrder).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {paginatedPokemons.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPokemons.map(pokemon => (
                    <div key={pokemon.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative">
                        <img 
                          src={pokemon.image_url} 
                          alt={pokemon.name} 
                          className="h-40 w-40 object-contain group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold border border-gray-200">
                          ID #{pokemon.id}
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{pokemon.name}</h3>
                            <p className={`text-sm font-semibold ${getRarityColorClass(pokemon.rarity)}`}>
                              {pokemon.rarity}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-indigo-600">{pokemon.score}</span>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Points</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedPokemonForDetails(pokemon);
                              setShowPokemonDetailsModal(true);
                            }}
                          >
                            Détails
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            Icon={DollarSign}
                            className="flex-1"
                            loading={loadingSell === pokemon.id}
                            onClick={() => handleSellPokemon(pokemon)}
                          >
                            Vendre
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 pt-8">
                    <Button 
                      variant="secondary" 
                      Icon={ArrowLeft} 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button 
                      variant="secondary" 
                      Icon={ArrowRight} 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white py-20 rounded-2xl shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 font-medium text-lg">Aucun Pokémon trouvé</p>
                  <p className="text-gray-400 text-sm">Générez-en quelques-uns pour commencer votre collection !</p>
                </div>
                <Button variant="primary" onClick={() => setCurrentView(View.HOME)}>
                  Aller au générateur
                </Button>
              </div>
            )}
          </div>
        )}

        {currentView === View.RANKING && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4 flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Classement Mondial</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {topScores.length > 0 ? (
                  topScores.map((score, index) => (
                    <div key={score.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <span className={`text-xl font-black w-8 ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900">{score.nickname || 'Anonyme'}</p>
                          <p className="text-xs text-gray-400">{new Date(score.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-xl font-black text-indigo-600">{score.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500 italic">
                    Aucun score enregistré pour le moment.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Enregistrer votre score</span>
              </h3>
              <p className="text-sm text-indigo-700">Votre score actuel est de <strong>{overallScore}</strong> points. Entrez un pseudo pour figurer dans le classement.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Votre pseudo..." 
                  value={sessionNickname}
                  onChange={(e) => setSessionNickname(e.target.value)}
                  maxLength={15}
                  className="flex-1 rounded-lg border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Button onClick={handleSaveSessionScore} disabled={overallScore <= 0}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:py-3 z-40">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setCurrentView(View.HOME)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === View.HOME ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-bold uppercase tracking-wide">Accueil</span>
          </button>
          <button 
            onClick={() => setCurrentView(View.COLLECTION)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === View.COLLECTION ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-bold uppercase tracking-wide">Collection</span>
          </button>
          <button 
            onClick={() => setCurrentView(View.RANKING)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === View.RANKING ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Trophy className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-bold uppercase tracking-wide">Classement</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <Modal alert={alert} onClose={closeAlert} />

      {/* Rarity Guide Modal */}
      {showRarityGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Info className="h-6 w-6" />
                <span>Guide des Raretés</span>
              </h3>
              <button onClick={() => setShowRarityGuideModal(false)} className="text-indigo-200 hover:text-white">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">Chaque Pokémon appartient à une catégorie de rareté qui détermine ses points et sa valeur de vente.</p>
              <div className="space-y-3">
                {Object.values(PokemonRarity).map(rarity => {
                  const details = POKEMON_RARITY_DETAILS[rarity];
                  const saleValue = RARITY_SALE_VALUES[rarity];
                  return (
                    <div key={rarity} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <span className={`font-bold ${getRarityColorClass(rarity)}`}>{rarity}</span>
                        <p className="text-xs text-gray-400">Score: {details.minScore}-{details.maxScore}</p>
                      </div>
                      <div className="flex items-center space-x-1 bg-amber-100 px-2 py-1 rounded-lg">
                        <DollarSign className="h-3 w-3 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">+{saleValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <Button onClick={() => setShowRarityGuideModal(false)}>Compris</Button>
            </div>
          </div>
        </div>
      )}

      {/* Pokemon Details Modal */}
      {showPokemonDetailsModal && selectedPokemonForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
              <button 
                onClick={() => setShowPokemonDetailsModal(false)}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-sm text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
              <img src={selectedPokemonForDetails.image_url} alt={selectedPokemonForDetails.name} className="h-56 w-56 object-contain" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
            </div>
            <div className="p-8 space-y-6 -mt-12 relative bg-white rounded-t-3xl">
              <div className="text-center">
                <p className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${getRarityColorClass(selectedPokemonForDetails.rarity)}`}>
                  {selectedPokemonForDetails.rarity}
                </p>
                <h3 className="text-3xl font-black text-gray-900">{selectedPokemonForDetails.name}</h3>
                <p className="text-gray-400 text-sm">Obtenu le {new Date(selectedPokemonForDetails.created_at).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Score</p>
                  <p className="text-2xl font-black text-indigo-600">{selectedPokemonForDetails.score}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Valeur</p>
                  <p className="text-2xl font-black text-amber-600">{RARITY_SALE_VALUES[selectedPokemonForDetails.rarity]}</p>
                </div>
              </div>

              <Button 
                className="w-full py-4 text-lg" 
                variant="secondary"
                onClick={() => setShowPokemonDetailsModal(false)}
              >
                Retour
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Added missing default export
export default App;
