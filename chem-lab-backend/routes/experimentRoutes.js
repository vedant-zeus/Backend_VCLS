import express from "express";
import Experiment from "../models/Experiment.js";
import PDFDocument from "pdfkit";

const router = express.Router();

/* -------- START -------- */
router.post("/start", async (req, res) => {
  try {
    const experiment = new Experiment();
    await experiment.save();
    console.log(`[START] Experiment started: ${experiment._id}`);
    res.status(201).json(experiment);
  } catch (error) {
    console.error("[START] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* -------- BATCH ADD STEPS -------- */
router.post("/batch-steps/:id", async (req, res) => {
  try {
    const { steps } = req.body;
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ message: "Steps array is required" });
    }

    const experiment = await Experiment.findById(req.params.id);

    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });

    // validate steps if needed, for now trust the client structure but ensure it's an array
    experiment.steps.push(...steps);

    await experiment.save();
    console.log(`[BATCH] Added ${steps.length} steps to experiment: ${experiment._id}`);
    res.json(experiment);
  } catch (error) {
    console.error("[BATCH] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* -------- ADD STEP (LEGACY - KEEP FOR BACKWARD COMPAT) -------- */
router.post("/step/:id", async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);

    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });

    experiment.steps.push(req.body);

    await experiment.save();
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------- FINISH -------- */
router.post("/finish/:id", async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);

    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });

    experiment.finalState = req.body;
    experiment.endTime = new Date();

    await experiment.save();

    console.log(`[FINISH] Experiment finished: ${experiment._id}`);
    res.json({ message: "Experiment finished", experiment });
  } catch (error) {
    console.error("[FINISH] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* -------- PDF REPORT -------- */
router.get("/report/:id", async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);

    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=lab-report-${experiment._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Virtual Chemistry Lab Report", {
      align: "center",
    });

    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Start Time: ${experiment.startTime ? new Date(experiment.startTime).toLocaleString() : 'N/A'}`);
    doc.text(`End Time: ${experiment.endTime ? new Date(experiment.endTime).toLocaleString() : 'N/A'}`);

    doc.moveDown();
    doc.text("Steps:");

    if (experiment.steps && experiment.steps.length > 0) {
      experiment.steps.forEach((step, i) => {
        doc.moveDown(0.5);
        doc.text(`${i + 1}. ${step.action || 'Unknown Action'}`);
        doc.text(`   Chemical: ${step.chemical || '-'}`);
        doc.text(`   Formula: ${step.formula || "-"}`);
        doc.text(`   Category: ${step.category || "-"}`);
        doc.text(`   Temp: ${step.temperature}°C`);

        if (step.equation)
          doc.text(`   Equation: ${step.equation}`);

        if (step.precipitate)
          doc.text("   Observation: Precipitate formed");

        if (step.gas)
          doc.text("   Observation: Gas evolved");
      });
    } else {
      doc.text("No steps recorded.");
    }

    doc.moveDown();
    doc.text("Final State:");
    if (experiment.finalState) {
        doc.text(`Temperature: ${experiment.finalState.temperature}°C`);
        doc.text(`Color: ${experiment.finalState.liquidColor}`);
        doc.text(
        `Solutes: ${experiment.finalState.solutes?.join(", ") || "None"}`
        );
    } else {
        doc.text("No final state recorded.");
    }

    doc.end();
  } catch (error) {
    console.error("[REPORT] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
