export type Locale = 'ru' | 'kk' | 'uz';
export type Species = 'dog' | 'cat' | 'snake';
export type Sex = 'male' | 'female' | 'unknown';
export type Parent = { name: string; id?: string; evidence: 'owner-reported' | 'unknown'; parents?: Parent[] };
export type Pet = {
  id: string; ownerId: string; name: string; species: Species; breed: string;
  sex: Sex; born: string; city: string; description: string; photoId?: string;
  pedigreeId?: string; parents: Parent[]; status: 'available' | 'introduction' | 'unavailable';
  isDemo: boolean; createdAt: string; updatedAt: string;
};
export type User = { id: string; name: string; provider: string; demo: boolean };
export type Meeting = {
  id: string; senderId: string; recipientId: string; animalId: string;
  ownAnimalId?: string; startsAt: string; endsAt: string; timezone: string;
  purpose: 'introduction' | 'breeding'; place: string; note: string;
  state: 'requested' | 'confirmed' | 'declined' | 'cancelled'; isDemo: boolean;
  createdAt: string;
};

export type AccountData={user:User;pets:Pet[];favoriteIds:string[];meetings:Meeting[]};
export type PublicPet=Omit<Pet,'ownerId'|'born'|'photoId'|'pedigreeId'|'createdAt'> & {birthDate:string|null;photoUrl:string|null};
