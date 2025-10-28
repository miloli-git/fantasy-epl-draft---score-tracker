
export interface FPLPlayer {
    id: number;
    first_name: string;
    second_name: string;
    web_name: string;
    team: number;
    element_type: number;
    now_cost: number;
    total_points: number;
    event_points: number;
    form: string;
    bonus: number;
    influence: string;
    creativity: string;
    threat: string;
}

export interface FPLTeam {
    id: number;
    name: string;
    short_name: string;
}

export interface FPLPosition {
    id: number;
    singular_name_short: string;
}

export interface FPLGameweek {
    id: number;
    name: string;
    finished: boolean;
    is_current: boolean;
}

export interface FPLBootstrap {
    elements: FPLPlayer[];
    teams: FPLTeam[];
    element_types: FPLPosition[];
    events: FPLGameweek[];
}

export interface Player extends FPLPlayer {
    team_name: string;
    team_short_name: string;
    position_short_name: string;
}

export interface Manager {
    id: string;
    name: string;
    cash: number;
    roster: number[]; // Array of player IDs
}

export interface HistoricalData {
    [playerId: number]: {
        [gameweek: number]: number; // gameweek -> points
    };
}