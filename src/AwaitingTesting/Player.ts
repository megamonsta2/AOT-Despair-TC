import { MAX_SCORE } from "../config/AwaitingTesting/Exams.js";
import { SerialisedPlayer } from "../utils/Types.js";

export default class Player {
  Username: string;

  KnowledgeTest?: number;
  BonusPoints?: number;

  Dummies?: number;
  Speed?: number;
  Obby!: [number, number]; // 0 is lowest, 1 is highest

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
    this.Obby = [MAX_SCORE.Obby, MAX_SCORE.Obby];
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
    if (!this.Dummies || this.Dummies > score) {
      this.Dummies = score;
    }
  }

  AddSpeed(score: number) {
    if (!this.Speed || this.Speed > score) {
      this.Speed = score;
    }
  }

  AddObby(score: number) {
    // If 1 is below score, score is too large
    if (this.Obby[1] <= score) return;

    // Input higher than 0
    if (this.Obby[0] < score) {
      this.Obby[1] = score;
      // Input lower than 0
    } else {
      this.Obby = [score, this.Obby[0]];
    }
  }

  GetObbyScore(): number | undefined {
    return Math.max(...(this.Obby as number[]));
  }

  AddTundra(score: number) {
    if (!this.Tundra || this.Tundra < score) {
      this.Tundra = score;
    }
  }

  AddTitanTraining(score: number) {
    if (!this.TitanTraining || this.TitanTraining < score) {
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
