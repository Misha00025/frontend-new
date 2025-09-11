export interface CharacterItem {
  id: number;
  name: string;
  description: string;
  amount: number;
  price: number;
  image_link: string | null;
}

export interface CharacterItemsResponse {
  items: CharacterItem[];
}

export interface CreateCharacterItemRequest {
  name: string;
  description: string;
  amount: number;
  price: number;
  image_link?: string;
}

export interface UpdateCharacterItemRequest extends CreateCharacterItemRequest {}