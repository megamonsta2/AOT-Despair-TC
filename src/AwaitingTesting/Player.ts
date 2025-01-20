import { MAX_SCORE } from "../config/AwaitingTesting/Exams.js";
import { SerialisedPlayer } from "../utils/Types.js";

export default class Player {
  Username: string;

  KnowledgeTest?: number;
  BonusPoints?: number;

  Dummies?: number;
  Speed?: number;
  Obby: [number, number];

  Tundra?: number;
  TitanTraining?: number;

  constructor(user: string) {
    this.Username = user;
    this.Obby = [0, 0];
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
    [this.Obby[0], this.Obby[1]] = [score, this.Obby[0]];
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
      Obby: Math.max(...this.Obby),
      Tundra: this.Tundra,
      TitanTraining: this.TitanTraining,
    };
  }
}
