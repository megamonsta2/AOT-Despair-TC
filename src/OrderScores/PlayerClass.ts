// Modules
import { CorePractical, AlternatePractical } from "../Constants.js";

export default class Player {
  Username: string;

  Knowledge!: number;
  BonusPoints!: number;

  Musket?: number;
  Speed?: number;
  Dummies?: number;
  ObstacleCourse?: number;
  GasConservation?: number;

  TitanTraining?: number;
  Tundra?: number;
  MusketRetrieval?: number;

  constructor(Username: string) {
    this.Username = Username;
  }

  AddKnowledge(score: number) {
    // If knowledge doesn't exist or exists and score is less than current knowledge
    if (!this.Knowledge || this.Knowledge > score) {
      this.Knowledge = score;
    }
  }

  AddBonusPoints(points: number, max: number) {
    if (!this.BonusPoints) {
      this.BonusPoints = 0;
    }

    if (this.BonusPoints + points <= max) {
      this.BonusPoints += points;
    } else {
      this.BonusPoints = max;
    }
  }

  AddCorePractical(type: CorePractical, score: number) {
    // If prac score doesn't exist or exists and score is less than current prac
    if (!this[type] || this[type] > score) {
      this[type] = score;
    }
  }

  AddAlternatePractical(type: AlternatePractical, score: number) {
    // If prac score doesn't exist or exists and score is greater than current prac
    if (!this[type] || this[type] < score) {
      this[type] = score;
    }
  }
}
