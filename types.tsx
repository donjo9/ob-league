export type UserInfo = {
  email: string;
};
export type LoginData = {
  id: string;
  secret: string;
  data: UserInfo;
};

export type LoginInputType = {
  email: string;
  password: string;
};

export type matchTeamInfo = {
  id: string;
  name: string;
};

export type matchMapInfo = {
  map: string;
  team1Score: number;
  team2Score: number;
};

export type matchInfoType = {
  id: string;
  team1: matchTeamInfo;
  team2: matchTeamInfo;
  maps: Array<matchMapInfo>;
  date: number;
  matchDone: boolean;
};
