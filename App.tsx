// App.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, DollarSign, Loader2, Zap, Trophy, HelpCircle, ListFilter, ArrowDownWideNarrow, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Pokemon, UserSetting, DBStatus, AppAlert, AlertType, PokemonRarity, PIKACHU_IMAGE_URL, SortOrder, ACCUMULATED_SALE_PROFIT_KEY } from './types';
import { openDB, addPokemon, getAllPokemon, deletePokemon, getUserSetting, putUserSetting } from './services/indexedDbService';
import { generatePokemon, POKEMON_RARITY_DETAILS, RARITY_SALE_VALUES } from './services/pokemonApiService';
import Button from './components/Button';
import Modal from './components/Modal';

const INITIAL_TOKENS = 100;
const GENERATION_COST = 10;

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [tokens, setTokens] = useState<number>(0);
  const [overallScore, setOverallScore] = useState<number>(0); // Unified score
  const [accumulatedSaleProfit, setAccumulatedSaleProfit] = useState<number>(0); // Persistent part of the overall score
  const [dbStatus, setDbStatus] = useState<DBStatus>(DBStatus.INITIALIZING);
  const [alert, setAlert] = useState<AppAlert>({ isOpen: false, message: '', type: AlertType.INFO, title: '' });
  const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);
  const [loadingSell, setLoadingSell] = useState<number | null>(null);
  const [showRarityGuideModal, setShowRarityGuideModal] = useState<boolean>(false);
  const [isTokenPulsing, setIsTokenPulsing] = useState<boolean>(false);
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<PokemonRarity | 'All'>('All');
  const [selectedSortOrder, setSelectedSortOrder] = useState<SortOrder>(SortOrder.DATE_DESC);
  // States for Pagination
  const [pokemonsPerPage] = useState(9); // Display 9 pokemons per page
  const [currentPage, setCurrentPage] = useState(1);
  // States for Pokemon Details Modal
  const [selectedPokemonForDetails, setSelectedPokemonForDetails] = useState<Pokemon | null>(null);
  const [showPokemonDetailsModal, setShowPokemonDetailsModal] = useState<boolean>(false);


  const showAlert = (message: string, type: AlertType, title?: string) => {
    setAlert({ isOpen: true, message, type, title: title || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() });
  };

  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

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
        console.log(`Initialized user tokens to ${INITIAL_TOKENS}`);
      }
      setTokens(userTokens.value as number);

      let userAccumulatedSaleProfit = await getUserSetting(ACCUMULATED_SALE_PROFIT_KEY);
      if (!userAccumulatedSaleProfit) {
        userAccumulatedSaleProfit = { key: ACCUMULATED_SALE_PROFIT_KEY, value: 0 };
        await putUserSetting(userAccumulatedSaleProfit);
        console.log(`Initialized accumulated sale profit to 0`);
      }
      setAccumulatedSaleProfit(userAccumulatedSaleProfit.value as number);

      setDbStatus(DBStatus.READY);
    } catch (error: any) {
      console.error("Error loading app data:", error);
      setDbStatus(DBStatus.ERROR);
      showAlert(`Failed to load app data: ${error.message}`, AlertType.ERROR, 'Loading Error');
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Effect to calculate Overall Score whenever pokemons or accumulatedSaleProfit changes
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
      showAlert(`Vous avez besoin de ${GENERATION_COST} jetons pour générer un Pokémon. Solde actuel : ${tokens}.`, AlertType.WARNING, 'Jetons Insuffisants');
      return;
    }

    setLoadingGenerate(true);
    try {
      await updateTokens(-GENERATION_COST);

      const newPokemonData = await generatePokemon();

      const addedPokemon = await addPokemon(newPokemonData);
      setPokemons((prevPokemons) => [...prevPokemons, addedPokemon]);

      showAlert(`Nouveau Pokémon généré : ${addedPokemon.name} (${addedPokemon.rarity}) !`, AlertType.SUCCESS, 'Pokémon Généré !');

    } catch (error: any) {
      console.error("Erreur lors de la génération du Pokémon :", error);
      showAlert(`Échec de la génération du Pokémon : ${error.message}`, AlertType.ERROR, 'Génération Échouée');
      if (tokens >= GENERATION_COST) {
        await updateTokens(GENERATION_COST);
        showAlert(`La génération du Pokémon a échoué, les jetons ont été remboursés. Erreur : ${error.message}`, AlertType.ERROR, 'Génération Échouée');
      }
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSellPokemon = async (pokemonToSell: Pokemon) => {
    setLoadingSell(pokemonToSell.id);
    try {
      await deletePokemon(pokemonToSell.id);
      setPokemons((prevPokemons) => prevPokemons.filter((pokemon) => pokemon.id !== pokemonToSell.id));

      const profit = RARITY_SALE_VALUES[pokemonToSell.rarity];
      await updateTokens(profit);

      // Update and persist accumulated sale profit
      setAccumulatedSaleProfit(prevProfit => {
        const newAccumulatedSaleProfit = prevProfit + profit;
        putUserSetting({ key: ACCUMULATED_SALE_PROFIT_KEY, value: newAccumulatedSaleProfit });
        return newAccumulatedSaleProfit;
      });

      showAlert(`Pokémon ${pokemonToSell.name} vendu avec succès ! Vous avez gagné ${profit} jetons.`, AlertType.SUCCESS, 'Pokémon Vendu !');
    } catch (error: any) {
      console.error(`Erreur lors de la vente du Pokémon ${pokemonToSell.id} :`, error);
      showAlert(`Échec de la vente du Pokémon : ${error.message}`, AlertType.ERROR, 'Vente Échouée');
    } finally {
      setLoadingSell(null);
    }
  };

  // Helper function to get rarity color class
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

  // Filtered and sorted pokemons for display, then paginated
  const filteredAndSortedPokemons = useMemo(() => {
    let currentPokemons = pokemons;

    // Apply rarity filter
    if (selectedRarityFilter !== 'All') {
      currentPokemons = currentPokemons.filter(pokemon => pokemon.rarity === selectedRarityFilter);
    }

    // Apply sort order
    currentPokemons = [...currentPokemons].sort((a, b) => {
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
    return currentPokemons;
  }, [pokemons, selectedRarityFilter, selectedSortOrder]);

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const displayedPokemons = filteredAndSortedPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);

  const totalFilteredPokemons = filteredAndSortedPokemons.length;
  const totalPages = Math.ceil(totalFilteredPokemons / pokemonsPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Reset current page to 1 when filters or sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRarityFilter, selectedSortOrder]);

  const handleInspectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemonForDetails(pokemon);
    setShowPokemonDetailsModal(true);
  };

  const closePokemonDetailsModal = () => {
    setSelectedPokemonForDetails(null);
    setShowPokemonDetailsModal(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 tracking-tight flex items-center gap-2">
        <img src={PIKACHU_IMAGE_URL} alt="Pikachu" className="h-10 w-10 md:h-12 md:w-12 -rotate-12 transform" />
        Pokémon Generator
        <img src={PIKACHU_IMAGE_URL} alt="Pikachu" className="h-10 w-10 md:h-12 md:w-12 rotate-12 transform" />
      </h1>

      <div className="w-full flex flex-col md:flex-row md:justify-between items-center mb-6 p-3 bg-indigo-50 rounded-lg shadow-inner border border-indigo-200">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-2 md:mb-0">
          <span className={`text-indigo-800 text-lg font-semibold flex items-center gap-2 transform ${isTokenPulsing ? 'animate-token-pulse' : ''}`}>
            <Zap className="h-5 w-5 text-yellow-500 fill-current" /> Jetons: <span className="text-xl font-bold">{tokens}</span>
          </span>
          <span className="text-indigo-800 text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 fill-current" /> Score Total: <span className="text-xl font-bold">{overallScore}</span>
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 mt-4 md:mt-0">
          <Button
            onClick={handleGeneratePokemon}
            Icon={Plus}
            loading={loadingGenerate}
            disabled={loadingGenerate || dbStatus !== DBStatus.READY || tokens < GENERATION_COST}
            size="sm"
            className="text-base py-2 w-full md:w-auto"
            aria-label="Générer un nouveau Pokémon"
          >
            Générer un nouveau Pokémon (Coût: {GENERATION_COST})
          </Button>
          {/* Removed empty children prop for icon-only button */}
          <Button
            onClick={() => setShowRarityGuideModal(true)}
            Icon={HelpCircle}
            variant="secondary"
            size="sm"
            className="w-9 h-9 p-0 rounded-full"
            aria-label="Afficher le guide de rareté"
          />
        </div>
      </div>

      {dbStatus === DBStatus.INITIALIZING && (
        <p className="text-gray-500 mb-4 flex items-center" aria-live="polite" aria-atomic="true">
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          Initialisation de la base de données et chargement des données Pokémon...
        </p>
      )}

      {dbStatus === DBStatus.READY && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4 self-start gap-4">
            <h2 className="text-2xl font-bold text-gray-600">Votre Collection de Pokémon</h2>
            {(pokemons.length > 0 || selectedRarityFilter !== 'All' || selectedSortOrder !== SortOrder.DATE_DESC) && (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {/* Rarity Filter */}
                <div className="relative flex items-center gap-2 w-full sm:w-auto">
                  <ListFilter className="h-5 w-5 text-gray-600" />
                  <select
                    value={selectedRarityFilter}
                    onChange={(e) => setSelectedRarityFilter(e.target.value as PokemonRarity | 'All')}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    aria-label="Filtrer les Pokémon par rareté"
                  >
                    <option value="All">Toutes les raretés</option>
                    {Object.values(PokemonRarity).map((rarity) => (
                      <option key={rarity} value={rarity}>
                        {rarity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="relative flex items-center gap-2 w-full sm:w-auto">
                  <ArrowDownWideNarrow className="h-5 w-5 text-gray-600" />
                  <select
                    value={selectedSortOrder}
                    onChange={(e) => setSelectedSortOrder(e.target.value as SortOrder)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    aria-label="Trier les Pokémon par"
                  >
                    {Object.values(SortOrder).map((order) => (
                      <option key={order} value={order}>
                        {order}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {displayedPokemons.length === 0 && totalFilteredPokemons === 0 ? (
            <p className="text-gray-500 text-center py-8 text-lg">
              Aucun Pokémon dans votre collection. Générez-en un !
            </p>
          ) : displayedPokemons.length === 0 && totalFilteredPokemons > 0 ? (
            <p className="text-gray-500 text-center py-8 text-lg">
              Aucun Pokémon ne correspond aux filtres/tri sur cette page.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {displayedPokemons.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  role="listitem"
                >
                  <img src={pokemon.image_url} alt={pokemon.name} className="w-24 h-24 mb-2 pixelated" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{pokemon.name}</h3>
                  <p className={`text-sm font-medium mb-1 ${getRarityColorClass(pokemon.rarity)}`}>
                    Rareté: {pokemon.rarity}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Valeur Pokédex: <span className="font-semibold text-gray-700">{pokemon.score}</span></p>
                  <p className="text-xs text-gray-500 mb-3">Profit de revente (Jetons): <span className="font-semibold text-yellow-600">{RARITY_SALE_VALUES[pokemon.rarity]}</span></p>

                  <div className="flex gap-2 mt-3 w-full">
                    <Button
                      variant="danger"
                      size="sm"
                      Icon={DollarSign}
                      onClick={() => handleSellPokemon(pokemon)}
                      loading={loadingSell === pokemon.id}
                      disabled={loadingSell !== null}
                      aria-label={`Vendre le Pokémon: ${pokemon.name}`}
                      className="flex-grow"
                    >
                      Vendre ({RARITY_SALE_VALUES[pokemon.rarity]} Jetons)
                    </Button>
                    {/* Removed empty children prop for icon-only button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      Icon={Info}
                      onClick={() => handleInspectPokemon(pokemon)}
                      aria-label={`Voir les détails du Pokémon: ${pokemon.name}`}
                      className="flex-none p-0 w-9 h-9 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalFilteredPokemons > pokemonsPerPage && (
            <div className="flex items-center justify-center mt-6 gap-2">
              {/* Removed empty children prop for icon-only button */}
              <Button
                Icon={ArrowLeft}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
                className="p-0 w-9 h-9 rounded-full"
                aria-label="Page précédente"
              />
              <span className="text-gray-700 font-medium">
                Page {currentPage} sur {totalPages}
              </span>
              {/* Removed empty children prop for icon-only button */}
              <Button
                Icon={ArrowRight}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
                className="p-0 w-9 h-9 rounded-full"
                aria-label="Page suivante"
              />
            </div>
          )}
        </>
      )}

      <Modal alert={alert} onClose={closeAlert} />

      {/* Rarity Guide Modal */}
      <Modal
        alert={{
          isOpen: showRarityGuideModal,
          type: AlertType.INFO,
          title: 'Guide de Rareté Pokémon',
          message: '' // Message is rendered as children
        }}
        onClose={() => setShowRarityGuideModal(false)}
      >
        <p className="mb-4 text-gray-700">Comprenez les différents niveaux de rareté, leurs plages de score et les jetons que vous obtenez en les vendant.</p>
        <ul className="list-disc pl-5 space-y-2">
          {Object.values(PokemonRarity).map((rarity) => {
            const details = POKEMON_RARITY_DETAILS[rarity];
            const saleValue = RARITY_SALE_VALUES[rarity];
            return (
              <li key={rarity} className="text-gray-800">
                <span className={`font-bold ${getRarityColorClass(rarity)}`}>{rarity}:</span> Score {details.minScore}-{details.maxScore} (Revente: <span className="font-semibold text-yellow-600">{saleValue} Jetons</span>)
              </li>
            );
          })}
        </ul>
      </Modal>

      {/* Pokemon Details Modal */}
      {selectedPokemonForDetails && (
        <Modal
          alert={{
            isOpen: showPokemonDetailsModal,
            type: AlertType.INFO,
            title: `Détails de ${selectedPokemonForDetails.name}`,
            message: '' // Content rendered as children
          }}
          onClose={closePokemonDetailsModal}
        >
          <div className="flex flex-col items-center p-4">
            <img
              src={selectedPokemonForDetails.image_url}
              alt={selectedPokemonForDetails.name}
              className="w-32 h-32 mb-4 pixelated"
            />
            <h4 className="text-2xl font-bold text-gray-800 mb-2">{selectedPokemonForDetails.name}</h4>
            <p className={`text-lg font-medium mb-1 ${getRarityColorClass(selectedPokemonForDetails.rarity)}`}>
              Rareté: {selectedPokemonForDetails.rarity}
            </p>
            <p className="text-md text-gray-600 mb-1">Score Pokédex: <span className="font-semibold">{selectedPokemonForDetails.score}</span></p>
            <p className="text-md text-gray-600 mb-1">Profit de revente: <span className="font-semibold text-yellow-600">{RARITY_SALE_VALUES[selectedPokemonForDetails.rarity]} Jetons</span></p>
            <p className="text-sm text-gray-500 mt-2">Généré le: {new Date(selectedPokemonForDetails.created_at).toLocaleDateString()}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;