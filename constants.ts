
import { GameState, Location, LocationId, Choice } from './types';

export const INITIAL_GAME_STATE: GameState = {
  hasEchoIntroducedSelf: false,
  ruins_artifact_found: false,
  ruins_puzzle_solved: false,
  future_city_power_level: 'offline',
  village_loop_broken: false,
  player_identity_clues: 0,
  lastActionImpact: null,
};

const placeholderImageBase = "https://picsum.photos/seed";

export const LOCATIONS: Record<LocationId, Location> = {
  [LocationId.CHRONOFALLS_EDGE]: {
    id: LocationId.CHRONOFALLS_EDGE,
    name: "Edge of the ChronoFalls",
    getImageUrl: () => `${placeholderImageBase}/chronofalls/800/600`,
    getDescription: (gs) => `Mist from the colossal ChronoFalls clings to you. The waterfall flows impossibly, segments of it rushing upwards, others down. Before you, an ancient, pulsating artifact hums. This is where your journey begins. ${gs.player_identity_clues > 0 ? `You recall a faint memory, a sense of urgency.` : ''}`,
    getEchoPrompt: (gs, impact) => {
      if (!gs.hasEchoIntroducedSelf) {
        return "Welcome, Traveler. I am Echo. This place... it remembers you, even if you do not. The artifact before you is a key. What will you do?";
      }
      return impact ? `Echo: "${impact}" The falls churn, reacting to your decision. What now?` : "Echo: The ChronoFalls shift with every choice. The path ahead is yours to shape.";
    },
    getChoices: (gs) => [
      {
        text: "Touch the Pulsating Artifact",
        nextLocationId: LocationId.ANCIENT_RUINS_ENTRANCE,
        action: () => ({ hasEchoIntroducedSelf: true, player_identity_clues: 1 }),
        impactDescription: "A jolt of temporal energy surges through you, revealing a path to ancient ruins."
      },
      {
        text: "Look into the Falls",
        action: (currentGs) => ({ lastActionImpact: currentGs.player_identity_clues > 0 ? "Visions of past and future blur, but one image clears: a forgotten emblem." : "The temporal currents are too chaotic to discern anything clearly." }),
        impactDescription: "You gaze into the temporal currents.",
        disabled: (currentGs) => currentGs.player_identity_clues >=2 
      },
    ],
  },
  [LocationId.ANCIENT_RUINS_ENTRANCE]: {
    id: LocationId.ANCIENT_RUINS_ENTRANCE,
    name: "Ancient Ruins Entrance",
    getImageUrl: () => `${placeholderImageBase}/ruins_entrance/800/600`,
    getDescription: (gs) => `Weathered stones form a crumbling archway. Glyphs, unlike any known language, cover the surfaces. The air is heavy with the scent of dust and ozone. ${gs.ruins_artifact_found ? 'The small artifact you found here hums faintly.' : ''}`,
    getEchoPrompt: (gs, impact) => impact ? `Echo: "${impact}" The ruins seem to respond. Interesting.` : "Echo: These ruins predate known history. Their creators vanished, leaving only whispers in time. Tread carefully.",
    getChoices: (gs) => [
      {
        text: "Examine the Glyphs",
        nextLocationId: LocationId.RUINS_CHAMBER,
        action: () => ({ player_identity_clues: gs.player_identity_clues + 1 }),
        impactDescription: "The glyphs resonate, showing you a hidden passage deeper into the ruins."
      },
      {
        text: "Search for loose stones",
        action: () => ({ ruins_artifact_found: true, lastActionImpact: "You find a small, intricately carved artifact hidden in a crevice." }),
        impactDescription: "You find a small artifact.",
        disabled: (currentGs) => currentGs.ruins_artifact_found
      },
      {
        text: "Proceed to Future City Overlook",
        nextLocationId: LocationId.FUTURE_CITY_OVERLOOK,
        impactDescription: "You decide to explore a different path through time."
      },
      {
        text: "Return to the ChronoFalls",
        nextLocationId: LocationId.CHRONOFALLS_EDGE,
        impactDescription: "You step back towards the heart of the temporal anomaly."
      },
    ],
  },
  [LocationId.RUINS_CHAMBER]: {
    id: LocationId.RUINS_CHAMBER,
    name: "Ruins Inner Chamber",
    getImageUrl: () => `${placeholderImageBase}/ruins_chamber/800/600`,
    getDescription: (gs) => `A vast chamber opens before you. A complex mechanism, covered in the same strange glyphs, sits at its center. ${gs.ruins_puzzle_solved ? 'The mechanism glows softly, its purpose fulfilled.' : 'It seems dormant, awaiting interaction.'} ${gs.ruins_artifact_found ? 'The artifact you carry vibrates, reacting to something in this room.' : ''}`,
    getEchoPrompt: (gs, impact) => impact ? `Echo: "${impact}" The chamber's energies shift.` : (gs.ruins_puzzle_solved ? "Echo: This device seems to have resonated with a distant time. The future may have changed." : "Echo: This mechanism... it's a temporal resonator. Activating it could have far-reaching consequences."),
    getChoices: (gs) => [
      ...(gs.ruins_artifact_found && !gs.ruins_puzzle_solved ? [{
        text: "Place artifact on the mechanism",
        action: () => ({ ruins_puzzle_solved: true, future_city_power_level: 'low' as const, player_identity_clues: gs.player_identity_clues + 1, lastActionImpact: "The mechanism activates, sending a pulse of energy through time! You feel a subtle shift in the temporal currents." }),
        impactDescription: "The mechanism activates, sending a pulse of energy through time!"
      } as Choice] : []),
      {
        text: "Study the mechanism further",
        action: () => ({ lastActionImpact: "The complexity is astounding, hinting at a deep understanding of temporal mechanics." }),
        impactDescription: "You gain more insight into its workings.",
        disabled: (currentGs) => currentGs.ruins_puzzle_solved
      },
      {
        text: "Return to Ruins Entrance",
        nextLocationId: LocationId.ANCIENT_RUINS_ENTRANCE,
        impactDescription: "You decide to leave the chamber for now."
      },
    ],
  },
  [LocationId.FUTURE_CITY_OVERLOOK]: {
    id: LocationId.FUTURE_CITY_OVERLOOK,
    name: "Future City Overlook",
    getImageUrl: (gs) => gs.future_city_power_level === 'stable' ? `${placeholderImageBase}/city_powered/800/600` : `${placeholderImageBase}/city_dark/800/600`,
    getDescription: (gs) => `You stand on a precipice overlooking a sprawling metropolis of gleaming towers and flying vehicles. ${gs.future_city_power_level === 'offline' ? 'However, the city is dark, its usual vibrant lights extinguished.' : (gs.future_city_power_level === 'low' ? 'Flickering lights indicate a low power state. Something is amiss.' : 'The city hums with energy, lights blazing!')}`,
    getEchoPrompt: (gs, impact) => impact ? `Echo: "${impact}" The future is not set in stone.` : `Echo: This is one possible future. Its state seems... ${gs.future_city_power_level === 'offline' ? 'precarious.' : (gs.future_city_power_level === 'low' ? 'unstable. Perhaps an action in the past could stabilize it?' : 'vibrant, thanks to your efforts.')}`,
    getChoices: (gs) => [
      {
        text: "Descend into the Tech Lab",
        nextLocationId: LocationId.TECH_LAB_ENTRANCE,
        impactDescription: "You find a hidden path leading down into the city's technological heart."
      },
      {
        text: "Observe the city",
        action: () => ({ lastActionImpact: "The scale of the city is breathtaking, a testament to what could be." }),
        impactDescription: "You take a moment to absorb the view."
      },
      {
        text: "Explore a Decaying Village path",
        nextLocationId: LocationId.DECAYING_VILLAGE_PATH,
        impactDescription: "A shimmer in the air reveals a path to a different era."
      },
      {
        text: "Return to the ChronoFalls",
        nextLocationId: LocationId.CHRONOFALLS_EDGE,
        impactDescription: "You journey back to the ChronoFalls."
      },
    ],
  },
   [LocationId.TECH_LAB_ENTRANCE]: {
    id: LocationId.TECH_LAB_ENTRANCE,
    name: "Tech Lab Entrance",
    getImageUrl: (gs) => gs.future_city_power_level === 'stable' ? `${placeholderImageBase}/lab_powered/800/600` : `${placeholderImageBase}/lab_dark/800/600`,
    getDescription: (gs) => `A sleek doorway slides open, revealing a high-tech laboratory. Consoles are dark. ${gs.future_city_power_level === 'offline' ? 'The lab is eerily silent, completely without power.' : (gs.future_city_power_level === 'low' ? 'Emergency lights flicker. Power is unstable. A console shows: ANCIENT ENERGY SIGNATURE DETECTED.' : 'Systems are online! Consoles display complex temporal schematics.')}`,
    getEchoPrompt: (gs, impact) => impact ? `Echo: "${impact}" This lab holds many secrets.` : `Echo: This lab was dedicated to studying temporal mechanics. ${gs.ruins_puzzle_solved && gs.future_city_power_level === 'low' ? "They detected the energy pulse from the ancient ruins. Fascinating!" : (gs.future_city_power_level === 'stable' ? 'Their research seems to have advanced significantly.' : 'Without power, its secrets remain hidden.')}`,
    getChoices: (gs) => [
      ...(gs.future_city_power_level === 'low' && gs.ruins_puzzle_solved ? [{
        text: "Interface with power console",
        action: () => ({ future_city_power_level: 'stable' as const, player_identity_clues: gs.player_identity_clues + 1, lastActionImpact: "By linking the ancient energy signature, you stabilize the city's power grid! The lab hums to life." }),
        impactDescription: "You stabilize the city's power grid."
      } as Choice] : []),
      {
        text: "Search for data logs",
        action: (currentGs) => ({ lastActionImpact: currentGs.future_city_power_level === 'stable' ? "You find corrupted logs mentioning 'Project Echo' and a 'First Traveler'." : "The systems are offline, no data accessible."}),
        impactDescription: "You attempt to access data logs.",
        disabled: (currentGs) => currentGs.future_city_power_level !== 'stable' && currentGs.player_identity_clues >= 3
      },
      {
        text: "Return to Future City Overlook",
        nextLocationId: LocationId.FUTURE_CITY_OVERLOOK,
        impactDescription: "You step back out to the overlook."
      },
    ],
  },
  [LocationId.DECAYING_VILLAGE_PATH]: {
    id: LocationId.DECAYING_VILLAGE_PATH,
    name: "Path to a Decaying Village",
    getImageUrl: () => `${placeholderImageBase}/village_path/800/600`,
    getDescription: (gs) => `The air grows heavy, and the vibrant colors of other times fade. Before you is a path leading to a village trapped in perpetual twilight. ${gs.village_loop_broken ? 'A sense of peace emanates from the village now.' : 'A faint, repetitive sound echoes from within.'}`,
    getEchoPrompt: (_gs, impact) => impact ? `Echo: "${impact}" This place is an echo of itself.` : "Echo: This village is caught in a localized time loop. Its inhabitants relive the same moments, unaware. Breaking such a loop is... delicate.",
    getChoices: (gs) => [
      {
        text: "Enter the Village Square",
        nextLocationId: gs.village_loop_broken ? LocationId.VILLAGE_SQUARE_LOOP2 : LocationId.VILLAGE_SQUARE_LOOP1, 
        impactDescription: "You step into the heart of the temporal anomaly."
      },
      {
        text: "Return to Future City Overlook",
        nextLocationId: LocationId.FUTURE_CITY_OVERLOOK,
        impactDescription: "You decide against entering the village for now."
      },
    ],
  },
  [LocationId.VILLAGE_SQUARE_LOOP1]: {
    id: LocationId.VILLAGE_SQUARE_LOOP1,
    name: "Village Square (Looping)",
    getImageUrl: () => `${placeholderImageBase}/village_loop1/800/600`,
    getDescription: () => "The village square is deserted, yet you feel watched. A child's laughter, abruptly cut short, echoes. Then silence. Then the laughter again. The loop is strong here.",
    getEchoPrompt: (_gs, impact) => impact ? `Echo: "${impact}" Each cycle reinforces the anomaly.` : "Echo: Observe carefully. The key to breaking a loop often lies in an element that *almost* changes.",
    getChoices: (gs: GameState) => [ // Added gs: GameState parameter
      {
        text: "Wait and observe the loop again",
        nextLocationId: LocationId.VILLAGE_SQUARE_LOOP1, 
        action: () => ({ lastActionImpact: "The child laughs, then silence. The sequence repeats identically." }),
        impactDescription: "You observe another cycle of the loop."
      },
      { 
        text: "Intervene at the moment of laughter (Requires Ancient Lullaby knowledge)",
        action: (currentGs: GameState) => currentGs.ruins_artifact_found ? ({ village_loop_broken: true, player_identity_clues: currentGs.player_identity_clues + 1, lastActionImpact: "You hum the Ancient Lullaby. The laughter changes, becomes peaceful. The oppressive atmosphere lifts!" }) : ({ lastActionImpact: "You try to intervene, but the loop resets too quickly. Something is missing." }),
        nextLocationId: gs.ruins_artifact_found ? LocationId.VILLAGE_SQUARE_LOOP2 : LocationId.VILLAGE_SQUARE_LOOP1, // Corrected: Uses 'gs' from getChoices(gs)
        impactDescription: "You attempt to break the loop.",
        disabled: (currentGs: GameState) => !currentGs.ruins_artifact_found 
      },
      {
        text: "Leave the village square",
        nextLocationId: LocationId.DECAYING_VILLAGE_PATH,
        impactDescription: "You retreat from the looping square."
      },
    ],
  },
  [LocationId.VILLAGE_SQUARE_LOOP2]: {
    id: LocationId.VILLAGE_SQUARE_LOOP2,
    name: "Village Square (Loop Broken)",
    getImageUrl: () => `${placeholderImageBase}/village_calm/800/600`,
    getDescription: () => "The oppressive atmosphere is gone. A gentle breeze rustles the leaves. The village seems at peace, the temporal loop finally broken. Faint, ghostly figures give nods of thanks before fading.",
    getEchoPrompt: (_gs, impact) => impact ? `Echo: "${impact}"` : "Echo: Balance restored. Even small acts of kindness can mend the fabric of time. The villagers are free.",
    getChoices: () => [
      {
        text: "Search for clues about the villagers",
        action: (gs) => ({ player_identity_clues: gs.player_identity_clues +1, lastActionImpact: "You find a worn journal detailing their peaceful life before the temporal anomaly, and a mention of 'sky visitors'." }),
        impactDescription: "You find a journal with valuable clues."
      },
      {
        text: "Leave the now peaceful village",
        nextLocationId: LocationId.DECAYING_VILLAGE_PATH,
        impactDescription: "You depart from the serene village."
      },
    ],
  },
  [LocationId.ECHO_CHAMBER]: { 
    id: LocationId.ECHO_CHAMBER,
    name: "Consulting Echo",
    getImageUrl: () => `${placeholderImageBase}/echo_chamber/800/600`,
    getDescription: () => "You focus your mind, reaching out to Echo for guidance within the temporal currents.",
    getEchoPrompt: () => "Echo: Ask what you will, Traveler. I will share what I can perceive from the flow of time.",
    getChoices: () => [], 
  },
};
