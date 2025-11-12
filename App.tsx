
// App.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Wand2, DollarSign, Loader2, Info } from 'lucide-react';
import { Pokemon, UserSetting, DBStatus, AppAlert, AlertType, PokemonRarity, SortOrder } from './types';
import { openDB, addPokemon, getAllPokemon, deletePokemon, getUserSetting, putUserSetting } from './services/indexedDbService';
import { generatePokemon as callGeneratePokemonApi } from './services/pokemonApiService';
import Button from './components/Button';
import Modal from './components/Modal';

const INITIAL_TOKENS = 100;
const GENERATION_COST = 10;

// Define a numerical mapping for rarity for sorting purposes
const RARITY_MAP: Record<PokemonRarity, number> = {
  [PokemonRarity.F]: 0,
  [PokemonRarity.E]: 1,
  [PokemonRarity.D]: 2,
  [PokemonRarity.C]: 3,
  [PokemonRarity.B]: 4,
  [PokemonRarity.A]: 5,
  [PokemonRarity.S]: 6,
  [PokemonRarity.S_PLUS]: 7,
};

// Define dynamic sale values based on rarity
const RARITY_SALE_VALUES: Record<PokemonRarity, number> = {
  [PokemonRarity.F]: 5,
  [PokemonRarity.E]: 7,
  [PokemonRarity.D]: 10,
  [PokemonRarity.C]: 12,
  [PokemonRarity.B]: 15,
  [PokemonRarity.A]: 20,
  [PokemonRarity.S]: 25,
  [PokemonRarity.S_PLUS]: 35,
};

// Define scoring values for owned vs sold Pokémon by rarity
const RARITY_POINTS_OWNED: Record<PokemonRarity, number> = {
  [PokemonRarity.F]: 1,
  [PokemonRarity.E]: 2,
  [PokemonRarity.D]: 3,
  [PokemonRarity.C]: 5,
  [PokemonRarity.B]: 8,
  [PokemonRarity.A]: 13,
  [PokemonRarity.S]: 21,
  [PokemonRarity.S_PLUS]: 34,
};

const RARITY_POINTS_SOLD: Record<PokemonRarity, number> = {
  [PokemonRarity.F]: 0.5,
  [PokemonRarity.E]: 1,
  [PokemonRarity.D]: 1.5,
  [PokemonRarity.C]: 2.5,
  [PokemonRarity.B]: 4,
  [PokemonRarity.A]: 6.5,
  [PokemonRarity.S]: 10.5,
  [PokemonRarity.S_PLUS]: 17,
};

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [tokens, setTokens] = useState<number>(0);
  const [dbStatus, setDbStatus] = useState<DBStatus>(DBStatus.INITIALIZING);
  const [alert, setAlert] = useState<AppAlert>({ isOpen: false, message: '', type: AlertType.INFO });
  const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);
  const [loadingSell, setLoadingSell] = useState<number | null>(null);

  const [isTokenPulsing, setIsTokenPulsing] = useState<boolean>(false);
  const [lastGeneratedPokemonId, setLastGeneratedPokemonId] = useState<number | null>(null);

  // New states for sorting and filtering
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DATE_DESC);
  const [rarityFilter, setRarityFilter] = useState<string>('all'); // 'all' or a specific PokemonRarity value

  // State for Pokémon details modal
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Pokedex Scoring states
  const [pokedexScore, setPokedexScore] = useState<number>(0);
  // This state is not directly used for DB, but helps trigger re-render for score calculation
  const [soldRarityCounts, setSoldRarityCounts] = useState<Record<PokemonRarity, number>>(
    Object.values(PokemonRarity).reduce((acc, rarity) => ({ ...acc, [rarity]: 0 }), {} as Record<PokemonRarity, number>)
  );

  const showAlert = (message: string, type: AlertType, title?: string) => {
    setAlert({ isOpen: true, message, type });
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
      // FIX: Add type assertion for userTokens.value as it's now 'any'
      setTokens(userTokens.value as number);

      let storedSoldRarityCounts = await getUserSetting('soldRarityCounts');
      if (!storedSoldRarityCounts || typeof storedSoldRarityCounts.value !== 'object') {
        // Initialize soldRarityCounts if not found or malformed
        const initialSoldCounts = Object.values(PokemonRarity).reduce((acc, rarity) => ({ ...acc, [rarity]: 0 }), {} as Record<PokemonRarity, number>);
        // FIX: The type of 'key' and 'value' in UserSetting is now 'string' and 'any', resolving the previous type errors.
        await putUserSetting({ key: 'soldRarityCounts', value: initialSoldCounts });
        setSoldRarityCounts(initialSoldCounts);
        console.log('Initialized sold rarity counts.');
      } else {
        setSoldRarityCounts(storedSoldRarityCounts.value as Record<PokemonRarity, number>);
      }

      setDbStatus(DBStatus.READY);
    } catch (error: any) {
      console.error("Error loading app data:", error);
      setDbStatus(DBStatus.ERROR);
      showAlert(`Failed to load app data: ${error.message}`, AlertType.ERROR, 'Loading Error');
    }
  }, []);

  useEffect(() => {
    loadAppData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTokens = useCallback(async (amount: number) => {
    const newTokens = tokens + amount;
    await putUserSetting({ key: 'tokens', value: newTokens });
    setTokens(newTokens);
    setIsTokenPulsing(true);
    setTimeout(() => setIsTokenPulsing(false), 500);
  }, [tokens]);


  const handleGeneratePokemon = async () => {
    if (tokens < GENERATION_COST) {
      showAlert(`You need ${GENERATION_COST} tokens to generate a Pokémon. Current balance: ${tokens}.`, AlertType.WARNING, 'Not Enough Tokens');
      return;
    }

    setLoadingGenerate(true);
    try {
      await updateTokens(-GENERATION_COST); // Decrement tokens immediately

      const apiPokemon = await callGeneratePokemonApi();

      const addedPokemon = await addPokemon(apiPokemon);
      setPokemons((prevPokemons) => [...prevPokemons, addedPokemon]);
      setLastGeneratedPokemonId(addedPokemon.id);

      showAlert('Pokémon generated successfully!', AlertType.SUCCESS, 'Success');

      setTimeout(() => setLastGeneratedPokemonId(null), 3000);
    } catch (error: any) {
      console.error("Error generating Pokémon:", error);
      showAlert(`Failed to generate Pokémon: ${error.message}`, AlertType.ERROR, 'Generation Failed');
      // If generation failed after tokens were decremented, consider refunding them
      // This is a simple example, a more robust solution would involve transaction rollback or server-side token management.
      if (tokens >= GENERATION_COST) { // Check if tokens were actually decremented
        await updateTokens(GENERATION_COST); // Refund tokens if API call failed
        showAlert(`Generation failed, tokens refunded. Error: ${error.message}`, AlertType.ERROR, 'Generation Failed');
      }
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSellPokemon = async (pokemonToSell: Pokemon) => {
    const saleProfit = RARITY_SALE_VALUES[pokemonToSell.rarity];
    if (saleProfit === undefined) {
      console.error(`Unknown rarity for selling: ${pokemonToSell.rarity}`);
      showAlert(`Could not sell Pokémon due to unknown rarity type.`, AlertType.ERROR, 'Selling Failed');
      return;
    }

    setLoadingSell(pokemonToSell.id);
    try {
      await deletePokemon(pokemonToSell.id);
      setPokemons((prevPokemons) => prevPokemons.filter((pokemon) => pokemon.id !== pokemonToSell.id));

      await updateTokens(saleProfit);

      // Update sold rarity counts
      const newSoldRarityCounts = {
        ...soldRarityCounts,
        [pokemonToSell.rarity]: (soldRarityCounts[pokemonToSell.rarity] || 0) + 1
      };
      // FIX: The type of 'key' and 'value' in UserSetting is now 'string' and 'any', resolving the previous type errors.
      await putUserSetting({ key: 'soldRarityCounts', value: newSoldRarityCounts });
      setSoldRarityCounts(newSoldRarityCounts);

      showAlert(`Pokémon sold successfully! You gained ${saleProfit} tokens.`, AlertType.SUCCESS, 'Pokémon Sold');
    } catch (error: any) {
      console.error(`Error selling Pokémon ${pokemonToSell.id}:`, error);
      showAlert(`Failed to sell Pokémon: ${error.message}`, AlertType.ERROR, 'Selling Failed');
    } finally {
      setLoadingSell(null);
    }
  };

  const handlePokemonDetailsClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const closePokemonDetailsModal = () => {
    setSelectedPokemon(null);
  };

  // Pokedex Score Calculation
  useEffect(() => {
    let currentScore = 0;

    // Add points for owned Pokemons
    for (const pokemon of pokemons) {
      currentScore += RARITY_POINTS_OWNED[pokemon.rarity] || 0;
    }

    // Add points for sold Pokemons
    for (const rarity in soldRarityCounts) {
      currentScore += (soldRarityCounts[rarity as PokemonRarity] || 0) * (RARITY_POINTS_SOLD[rarity as PokemonRarity] || 0);
    }

    setPokedexScore(Math.floor(currentScore)); // Ensure score is an integer
  }, [pokemons, soldRarityCounts]); // Recalculate when pokemons or sold counts change


  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8; // Number of Pokémon per page

  const sortedAndFilteredPokemons = useMemo(() => {
    let visiblePokemons = [...pokemons];

    // Apply filter
    if (rarityFilter !== 'all') {
      visiblePokemons = visiblePokemons.filter((pokemon) => pokemon.rarity === rarityFilter);
    }

    // Apply sort
    visiblePokemons.sort((a, b) => {
      switch (sortOrder) {
        case SortOrder.DATE_ASC:
          return new Date(a.generated_at).getTime() - new Date(b.generated_at).getTime();
        case SortOrder.DATE_DESC:
          return new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime();
        case SortOrder.RARITY_ASC:
          return RARITY_MAP[a.rarity] - RARITY_MAP[b.rarity];
        case SortOrder.RARITY_DESC:
          return RARITY_MAP[b.rarity] - RARITY_MAP[a.rarity];
        default:
          return 0;
      }
    });
    return visiblePokemons;
  }, [pokemons, rarityFilter, sortOrder]);

  // Recalculate total pages and reset current page if filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [rarityFilter, sortOrder]);

  const totalPages = Math.ceil(sortedAndFilteredPokemons.length / ITEMS_PER_PAGE);
  const paginatedPokemons = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedAndFilteredPokemons.slice(startIndex, endIndex);
  }, [sortedAndFilteredPokemons, currentPage, ITEMS_PER_PAGE]);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    goToPage(currentPage - 1);
  };


  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 tracking-tight flex items-center gap-2">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" alt="Pikachu icon" className="h-10 w-10" />
        Pokémon Generator
      </h1>

      <div className="w-full flex flex-col md:flex-row md:justify-between items-center mb-6 p-3 bg-indigo-100 rounded-lg shadow-inner">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-2 md:mb-0">
          <span className={`text-indigo-800 text-lg font-semibold flex items-center gap-2 transform ${isTokenPulsing ? 'animate-token-pulse' : ''}`}>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball token" className="h-6 w-6" />
            Tokens: <span className="text-xl font-bold">{tokens}</span>
          </span>
          <span className="text-purple-800 text-lg font-semibold flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/items/rare-candy.png" alt="Pokedex Score icon" className="h-6 w-6" />
            Pokedex Score: <span className="text-xl font-bold">{pokedexScore}</span>
          </span>
        </div>
        <Button
          onClick={handleGeneratePokemon}
          Icon={Wand2}
          loading={loadingGenerate}
          disabled={loadingGenerate || dbStatus !== DBStatus.READY || tokens < GENERATION_COST}
          className="text-lg py-2.5 w-full md:w-auto"
          aria-label="Generate new Pokémon"
        >
          Generate Pokémon (Cost: {GENERATION_COST})
        </Button>
      </div>

      {dbStatus === DBStatus.INITIALIZING && (
        <p className="text-indigo-500 mb-4 flex items-center" aria-live="polite" aria-atomic="true">
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          Initializing database and loading data...
        </p>
      )}

      {dbStatus === DBStatus.READY && (
        <>
          <h2 className="text-2xl font-bold text-indigo-600 mb-4 self-start">Your Collection</h2>

          {/* Sort and Filter Controls */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <label htmlFor="sort-order" className="text-gray-700 font-medium whitespace-nowrap">Sort by:</label>
              <select
                id="sort-order"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                aria-label="Sort Pokémon collection"
              >
                <option value={SortOrder.DATE_DESC}>Newest First</option>
                <option value={SortOrder.DATE_ASC}>Oldest First</option>
                <option value={SortOrder.RARITY_DESC}>Rarity (High to Low)</option>
                <option value={SortOrder.RARITY_ASC}>Rarity (Low to High)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <label htmlFor="rarity-filter" className="text-gray-700 font-medium whitespace-nowrap">Filter by Rarity:</label>
              <div className="relative group flex items-center w-full"> {/* Added group for hover */}
                <select
                  id="rarity-filter"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3 pr-8"
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  aria-label="Filter Pokémon by rarity"
                >
                  <option value="all">All Rarities</option>
                  {Object.values(PokemonRarity).map((rarity) => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
                <Info
                  className="absolute right-2 h-4 w-4 text-gray-400 cursor-help"
                  aria-label="Rarity scale information"
                />
                {/* Rarity Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max max-w-xs p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <p className="font-semibold mb-1">Pokémon Rarity Scale:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><span className="font-bold text-green-300">F:</span> Common</li>
                    <li><span className="font-bold text-green-300">E:</span> Common</li>
                    <li><span className="font-bold text-yellow-300">D:</span> Uncommon</li>
                    <li><span className="font-bold text-yellow-300">C:</span> Uncommon</li>
                    <li><span className="font-bold text-orange-300">B:</span> Rare</li>
                    <li><span className="font-bold text-orange-300">A:</span> Rare</li>
                    <li><span className="font-bold text-purple-300">S:</span> Epic</li>
                    <li><span className="font-bold text-red-300">S+:</span> Legendary</li>
                  </ul>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45 transform origin-bottom-left -mb-1"></div>
                </div>
              </div>
            </div>
          </div>


          {paginatedPokemons.length === 0 && sortedAndFilteredPokemons.length === 0 ? (
             <p className="text-gray-500 text-center py-8 text-lg">
               No Pokémon in your collection matching the current filters.
             </p>
           ) : paginatedPokemons.length === 0 && sortedAndFilteredPokemons.length > 0 ? (
             <p className="text-gray-500 text-center py-8 text-lg">
               No Pokémon on this page. Adjust page number or filters.
             </p>
           ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {paginatedPokemons.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`flex flex-col items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer
                  ${pokemon.id === lastGeneratedPokemonId ? 'animate-new-pokemon-reveal animate-temporary-ring' : 'animate-fade-in-up'}`}
                  onClick={() => handlePokemonDetailsClick(pokemon)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${pokemon.name}`}
                >
                  <img
                    src={`data:image/png;base64,${pokemon.image_base64}`}
                    alt={pokemon.name}
                    className="w-32 h-32 object-contain mb-3 bg-white rounded-md p-2 border border-gray-100"
                    loading="lazy"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{pokemon.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Rarity: <span className="font-bold text-indigo-600">{pokemon.rarity}</span></p>
                  <p className="text-xs text-gray-400 mb-3">
                    Generated: {new Date(pokemon.generated_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    Icon={DollarSign}
                    onClick={(e) => { e.stopPropagation(); handleSellPokemon(pokemon); }} // Prevent modal from opening on sell click, pass full pokemon
                    loading={loadingSell === pokemon.id}
                    disabled={loadingSell !== null}
                    aria-label={`Sell Pokémon: ${pokemon.name}`}
                    className="w-full"
                  >
                    Sell (Earn {RARITY_SALE_VALUES[pokemon.rarity]} Tokens)
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => goToPage(index + 1)}
                  aria-label={`Page ${index + 1}`}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          )}
          {totalPages > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Page {currentPage} of {totalPages}
            </p>
          )}

        </>
      )}

      <Modal alert={alert} onClose={closeAlert} />

      {/* Pokémon Details Modal */}
      {selectedPokemon && (
        <Modal
          alert={{ isOpen: true, message: '', type: AlertType.INFO }} // Dummy alert for modal control
          onClose={closePokemonDetailsModal}
          title={`Pokémon Details: ${selectedPokemon.name}`}
        >
          <div className="flex flex-col items-center p-4">
            <img
              src={`data:image/png;base64,${selectedPokemon.image_base64}`}
              alt={selectedPokemon.name}
              className="w-48 h-48 object-contain mb-4 bg-gray-100 rounded-lg shadow-md p-3"
            />
            <h3 className="text-3xl font-bold text-indigo-700 mb-2">{selectedPokemon.name}</h3>
            <p className="text-lg text-gray-700 mb-1">Rarity: <span className="font-extrabold text-indigo-600">{selectedPokemon.rarity}</span></p>
            <p className="text-sm text-gray-500">
              Generated On: {new Date(selectedPokemon.generated_at).toLocaleString()}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
