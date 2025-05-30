export interface IMessReport {
  messName: string;
  mealRate: number;
  totalCost: number;
  totalMeal: number;
  balance: number;
  date: Date;
}
export interface IMyReport {
  totalMeals: number;
  totalExpense: number;
  payToMess: number;
  receiveFromMess: number;
  date: Date;
}
export interface IConsumptionDetails {
  vegetables: number; // Vegetables consumption
  fruits: number; // Fruits consumption
  meat: number; // Meat consumption
  fish: number; // Fish consumption
  oil: number; // Oil consumption
  salt: number; // Salt consumption
  rice: number; // Rice consumption
  wheat: number; // Wheat consumption
  lentils: number; // Lentils consumption
  cleaningSupplies: number; // Cleaning supplies consumption

  // Masala Consumption
  turmeric: number; // Turmeric (Haldi)
  chiliPowder: number; // Chili Powder (Lal Mirch)
  coriander: number; // Coriander (Dhania)
  cumin: number; // Cumin (Jeera)
  blackPepper: number; // Black Pepper (Kali Mirch)
  garamMasala: number; // Garam Masala
  cardamom: number; // Cardamom (Elaichi)
  cloves: number; // Cloves (Laung)
  bayLeaf: number; // Bay Leaf (Tej Patta)
  mustardSeed: number; // Mustard Seed (Rai/Sarson)
  fenugreek: number; // Fenugreek (Methi)
  fennel: number; // Fennel (Saunf)
  cinnamon: number; // Cinnamon (Dalchini)
  nutmeg: number; // Nutmeg (Jaiphal)
  starAnise: number; // Star Anise (Chakr Phool)
  asafetida: number; // Asafoetida (Hing)
}
