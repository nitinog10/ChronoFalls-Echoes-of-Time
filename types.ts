
export enum LocationId {
  CHRONOFALLS_EDGE = 'CHRONOFALLS_EDGE',
  ANCIENT_RUINS_ENTRANCE = 'ANCIENT_RUINS_ENTRANCE',
  RUINS_CHAMBER = 'RUINS_CHAMBER',
  FUTURE_CITY_OVERLOOK = 'FUTURE_CITY_OVERLOOK',
  TECH_LAB_ENTRANCE = 'TECH_LAB_ENTRANCE',
  DECAYING_VILLAGE_PATH = 'DECAYING_VILLAGE_PATH',
  VILLAGE_SQUARE_LOOP1 = 'VILLAGE_SQUARE_LOOP1',
  VILLAGE_SQUARE_LOOP2 = 'VILLAGE_SQUARE_LOOP2',
  ECHO_CHAMBER = 'ECHO_CHAMBER', // A special location to consult Echo
}

export interface GameState {
  hasEchoIntroducedSelf: boolean;
  ruins_artifact_found: boolean;
  ruins_puzzle_solved: boolean;
  future_city_power_level: 'offline' | 'low' | 'stable';
  village_loop_broken: boolean;
  player_identity_clues: number; // Counter for clues
  lastActionImpact: string | null; // Feedback on choice impact
}

export interface Choice {
  text: string;
  nextLocationId?: LocationId;
  action?: (gameState: GameState) => Partial<GameState>; // Modifies gameState
  disabled?: (gameState: GameState) => boolean; // Conditionally disable choice
  impactDescription?: string; // Short description of the choice's impact
}

export interface Location {
  id: LocationId;
  name: string;
  getImageUrl: (gameState: GameState) => string;
  getDescription: (gameState: GameState) => string;
  getEchoPrompt: (gameState: GameState, lastImpact: string | null) => string;
  getChoices: (gameState: GameState) => Choice[];
}

export interface EchoMessage {
  text: string;
  sender: 'Echo' | 'System' | 'Player';
}
    