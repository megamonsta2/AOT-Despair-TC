import { MAX_SCORE } from "../config/AwaitingTesting/Exams.js";
import { SerialisedPlayer } from "../utils/Types.js";

export default class Player {
  Username: string;

  KnowledgeTest?: number;
  BonusPoints?: number;

  Dummies?: number;
  Speed?: number;
  Obby!: [number | undefined, number | undefined];

  Tundra?: number;
  TitanTraining?: number;

  constructor(user: string) {
    this.Username = user;
    this.Reset();
  }

  Reset() {
    this.KnowledgeTest = undefined;
    this.BonusPoints = undefined;
    this.Dummies = undefined;
    this.Speed = undefined;
    this.Obby = [undefined, undefined];
    this.Tundra = undefined;
    this.TitanTraining = undefined;
  }

  AddKnowledge(score: number) {
    if (!this.KnowledgeTest || this.KnowledgeTest > score) {
      this.KnowledgeTest = score;
    }
  }

  AddBonusPoints(points: number) {
    if (!this.BonusPoints) {
      this.BonusPoints = points;
    } else {
      this.BonusPoints += points;
    }

    if (this.BonusPoints > MAX_SCORE.BonusPoints) {
      this.BonusPoints = MAX_SCORE.BonusPoints;
    }
  }

  AddDummies(score: number) {
    if (!this.Dummies) {
      this.Dummies = score;
    }
  }

  AddSpeed(score: number) {
    if (!this.Speed) {
      this.Speed = score;
    }
  }

  AddObby(score: number) {
    // If has 2nd score, end
    if (this.Obby[1]) return;

    // If has 1st score, assign to 2nd score
    if (this.Obby[0]) {
      this.Obby[1] = score;
      return;
    }

    // Assign to 1st score
    this.Obby[0] = score;
  }

  GetObbyScore(): number | undefined {
    if (this.Obby[1]) {
      return Math.max(...(this.Obby as number[]));
    } else {
      return this.Obby[0];
    }
  }

  AddTundra(score: number) {
    if (!this.Tundra) {
      this.Tundra = score;
    }
  }

  AddTitanTraining(score: number) {
    if (!this.TitanTraining) {
      this.TitanTraining = score;
    }
  }

  Serialise(): SerialisedPlayer {
    return {
      Username: this.Username,
      Knowledge: this.KnowledgeTest,
      BonusPoints: this.BonusPoints,
      Dummies: this.Dummies,
      Speed: this.Speed,
      Obby: this.GetObbyScore(),
      Tundra: this.Tundra,
      TitanTraining: this.TitanTraining,
    };
  }
}
