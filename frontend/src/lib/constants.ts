export const API_BASE_URL = "https://trello-clone-aku6.onrender.com/api/v1";
// export const API_BASE_URL = "http://localhost:5000/api/v1";

export const DEBOUNCE_MS = 300;

export const TRELLO_BLUE = "#0079bf";
export const TRELLO_LIST_BG = "#ebecf0";
export const TRELLO_NAV_BG = "#0052cc";

export const LABEL_COLORS = [
  "#61bd4f",
  "#f2d600",
  "#ff9f1a",
  "#eb5a46",
  "#c377e0",
  "#0079bf",
  "#00c2e0",
  "#51e898",
  "#344563",
  "#b3bac5",
] as const;

/** Trello's 30-label palette: 5 columns × 6 rows (dark → normal → light per hue). */
export const LABEL_COLOR_GRID = [
  "#59ac44",
  "#e7c60b",
  "#e79217",
  "#cf513d",
  "#a86cc1",
  "#6fc25f",
  "#f2d918",
  "#fea72f",
  "#ec6957",
  "#c883e2",
  "#b7deb0",
  "#f6ea92",
  "#fbd19c",
  "#f0b3ab",
  "#dfc0eb",
  "#036aa7",
  "#03aecc",
  "#4fd582",
  "#e668af",
  "#081f42",
  "#1885c4",
  "#18c7e2",
  "#61e9a1",
  "#fe84cf",
  "#486271",
  "#8cbed9",
  "#90dfeb",
  "#b3f1d0",
  "#f8c2e4",
  "#506079",
] as const;

export const LABEL_COLOR_NAMES: Record<string, string> = {
  "#59ac44": "bold green",
  "#e7c60b": "bold yellow",
  "#e79217": "bold orange",
  "#cf513d": "bold red",
  "#a86cc1": "bold purple",
  "#6fc25f": "green",
  "#f2d918": "yellow",
  "#fea72f": "orange",
  "#ec6957": "red",
  "#c883e2": "purple",
  "#b7deb0": "subtle green",
  "#f6ea92": "subtle yellow",
  "#fbd19c": "subtle orange",
  "#f0b3ab": "subtle red",
  "#dfc0eb": "subtle purple",
  "#036aa7": "bold blue",
  "#03aecc": "bold sky",
  "#4fd582": "bold lime",
  "#e668af": "bold pink",
  "#081f42": "bold black",
  "#1885c4": "blue",
  "#18c7e2": "sky",
  "#61e9a1": "lime",
  "#fe84cf": "pink",
  "#486271": "black",
  "#8cbed9": "subtle blue",
  "#90dfeb": "subtle sky",
  "#b3f1d0": "subtle lime",
  "#f8c2e4": "subtle pink",
  "#506079": "subtle black",
};

export const BOARD_BACKGROUNDS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#4bbf6b",
  "#00aecc",
  "#838c91",
] as const;
