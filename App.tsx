
import React, { useState, useEffect, useCallback } from 'react';
import { LocationId, GameState, Choice, Location, EchoMessage } from './types';
import { INITIAL_GAME_STATE, LOCATIONS } from './constants';
import LocationDisplay from './components/LocationDisplay';
import EchoDialog from './components/EchoDialog';
import ChoiceButton from './components/ChoiceButton';
import { askEchoAI } from './services/geminiService';

const App: React.FC = () => {
  const [currentLocationId, setCurrentLocationId] = useState<LocationId>(LocationId.CHRONOFALLS_EDGE);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [echoOutput, setEchoOutput] = useState<string>("");
  const [isLoadingEcho, setIsLoadingEcho] = useState<boolean>(false);
  const [showConsultInput, setShowConsultInput] = useState<boolean>(false);
  const [consultQuery, setConsultQuery] = useState<string>("");

  const currentLocDetails = LOCATIONS[currentLocationId];

  useEffect(() => {
    // Update Echo's prompt when location or critical game state changes.
    // This ensures Echo's initial message for a location reflects the current world state.
    const newEchoPrompt = currentLocDetails.getEchoPrompt(gameState, gameState.lastActionImpact);
    setEchoOutput(newEchoPrompt);
    // Reset lastActionImpact after displaying it
    if (gameState.lastActionImpact) {
      setGameState(prev => ({ ...prev, lastActionImpact: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocationId, gameState.ruins_puzzle_solved, gameState.future_city_power_level, gameState.village_loop_broken]); // Dependencies carefully chosen


  const handleChoice = useCallback((choice: Choice) => {
    setIsLoadingEcho(false); // Stop any AI loading
    setShowConsultInput(false); // Close consult input if open

    let nextGameState = { ...gameState };
    if (choice.action) {
      const modifications = choice.action(nextGameState);
      nextGameState = { ...nextGameState, ...modifications };
    }
    
    if (choice.impactDescription) {
        nextGameState.lastActionImpact = choice.impactDescription;
    } else {
        nextGameState.lastActionImpact = `You chose: "${choice.text}"`;
    }

    setGameState(nextGameState);

    if (choice.nextLocationId) {
      setCurrentLocationId(choice.nextLocationId);
      // Echo's prompt for the new location will be set by the useEffect hook watching currentLocationId
    } else {
      // If staying in the same location, update Echo's prompt based on the action's result
      const newEchoPrompt = LOCATIONS[currentLocationId].getEchoPrompt(nextGameState, nextGameState.lastActionImpact);
      setEchoOutput(newEchoPrompt);
      // Reset lastActionImpact after displaying it for non-location change
      setGameState(prev => ({ ...prev, lastActionImpact: null }));
    }
  }, [gameState, currentLocationId]);

  const startConsultEcho = () => {
    setShowConsultInput(true);
    setEchoOutput("Echo: What mysteries do you wish to unravel from the timestream?");
  };
  
  const submitConsultEcho = async () => {
    if (!consultQuery.trim()) {
      setEchoOutput("Echo: Speak your query, Traveler, if you seek answers.");
      return;
    }
    
    setIsLoadingEcho(true);
    setShowConsultInput(false); 
    setEchoOutput("Echo is focusing on the temporal currents..."); // Placeholder while AI thinks

    try {
      const aiResponse = await askEchoAI(consultQuery, currentLocationId, gameState);
      setEchoOutput(`You asked: "${consultQuery}"\n\nEcho: ${aiResponse}`);
    } catch (error) {
      console.error("Failed to get response from Echo AI:", error);
      setEchoOutput("Echo: The connection is unstable... I could not perceive an answer.");
    } finally {
      setIsLoadingEcho(false);
      setConsultQuery(""); 
    }
  };


  const availableChoices = currentLocDetails.getChoices(gameState);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl mb-6 md:mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 py-2">
          ChronoFalls: Echoes of Time
        </h1>
        <p className="text-slate-400 text-sm md:text-base">Clues to your identity: {gameState.player_identity_clues}</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <section className="lg:col-span-2">
          <LocationDisplay location={currentLocDetails} gameState={gameState} />
        </section>

        <aside className="lg:col-span-1 flex flex-col gap-6">
          <EchoDialog 
            message={echoOutput} 
            isThinking={isLoadingEcho}
            onConsultEcho={startConsultEcho}
            canConsult={!showConsultInput && currentLocDetails.id !== LocationId.ECHO_CHAMBER}
          />
          
          {showConsultInput && (
            <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-teal-700">
              <h4 className="text-lg font-semibold text-teal-400 mb-2">Ask Echo</h4>
              <textarea
                value={consultQuery}
                onChange={(e) => setConsultQuery(e.target.value)}
                placeholder="Type your question for Echo..."
                rows={3}
                className="w-full p-2 rounded bg-slate-700 text-slate-200 border border-slate-600 focus:ring-teal-500 focus:border-teal-500"
                disabled={isLoadingEcho}
              />
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={submitConsultEcho}
                  disabled={isLoadingEcho || !consultQuery.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md transition-colors duration-150 disabled:opacity-50"
                >
                  {isLoadingEcho ? 'Asking...' : 'Send to Echo'}
                </button>
                <button 
                  onClick={() => { setShowConsultInput(false); setEchoOutput(currentLocDetails.getEchoPrompt(gameState, null)); }}
                  disabled={isLoadingEcho}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showConsultInput && (
            <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-indigo-700">
              <h3 className="text-xl font-semibold text-indigo-400 mb-3">Your Choices</h3>
              {availableChoices.length > 0 ? (
                availableChoices.map((choice, index) => (
                  <ChoiceButton
                    key={`${currentLocationId}-choice-${index}`}
                    text={choice.text}
                    onClick={() => handleChoice(choice)}
                    disabled={choice.disabled ? choice.disabled(gameState) : false}
                    title={choice.impactDescription}
                  />
                ))
              ) : (
                <p className="text-slate-400">No choices available at this moment.</p>
              )}
            </div>
          )}
        </aside>
      </main>
      
      <footer className="w-full max-w-5xl mt-8 pt-4 border-t border-slate-700 text-center">
        <p className="text-sm text-slate-500">
          Powered by Temporal Ripples & Gemini AI. Tread carefully, Traveler.
        </p>
      </footer>
    </div>
  );
};

export default App;
    