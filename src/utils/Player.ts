import exams from "../config/Exams.json" with { type: "json" };
import { SerialisedPlayer } from "../utils/Types.js";

export default class Player {
  Username: string;

  KnowledgeTest?: number;
  BonusPoints?: number;

  Dummies?: number;
  Speed?: number;
  Obby?: number;

  constructor(user: string) {
    this.Username = user;
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

    if (this.BonusPoints > exams.BonusPoints.MAX) {
      this.BonusPoints = exams.BonusPoints.MAX;
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
    if (!this.Obby || this.Obby > score) {
      this.Obby = score;
    }
  }

  Serialise(): SerialisedPlayer {
    return {
      Username: this.Username,
      Knowledge: this.KnowledgeTest,
      BonusPoints: this.BonusPoints,
      Dummies: this.Dummies,
      Speed: this.Speed,
      Obby: this.Obby,
    };
  }
}
