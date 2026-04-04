import mongoose from "mongoose";

const stepSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["add_solvent", "add_solute", "reaction_triggered"],
      required: true,
    },

    chemical: { type: String, required: true },
    formula: { type: String },
    category: { type: String, enum: ["acid", "base", "salt", "solvent"] },

    temperature: { type: Number, required: true },
    liquidColor: { type: String, required: true },

    reactionType: { type: String },
    equation: { type: String },
    precipitate: { type: Boolean, default: false },
    gas: { type: Boolean, default: false },

    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const experimentSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    default: Date.now,
  },

  steps: {
    type: [stepSchema],
    default: [],
  },

  finalState: {
    temperature: Number,
    liquidColor: String,
    solutes: [String],
    reactionType: String,
    equation: String,
    precipitate: Boolean,
    gas: Boolean,
  },

  endTime: Date,
});

export default mongoose.model("Experiment", experimentSchema);
