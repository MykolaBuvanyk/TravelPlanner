export type TripPlace = {
  placeId: string;
  isVisited: boolean;
  addedAt: string;
};

export type Trip = {
  id: string;
  name: string;
  places: TripPlace[];
  createdAt: string;
  updatedAt: string;
};

export type TripProgress = {
  total: number;
  visited: number;
  percentage: number;
};
