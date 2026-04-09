require("dotenv").config();

const express = require("express");
const cors = require("cors");
const icalModule = require("ical-generator");
const { normalizeInputData, parsePrompt } = require("./lib/parser");
const { applySubstitution, autoSubstituteForDay, generateSchedule } = require("./lib/scheduler");
const { buildDemoData, demoPrompt } = require("./lib/demoScenario");
const { getHackathonDemoSchedule } = require("./lib/hackathonDemoSchedule");
const { callOllama, checkOllamaStatus } = require("./lib/ollamaHelper");
const { suggestCourseRequirements, suggestRoomAssignment, suggestPreferredDays, validateCourseData } = require("./lib/aiSmartInput");
const { parseCoursesFromText, parseCSVData, extractCoursesFromPrompt, validateExtractedData } = require("./lib/aiDataParser");
const { analyzeScheduleQuality, detectConflicts, suggestOptimizations, costAnalysis } = require("./lib/aiScheduleAnalyzer");
const { recordTeacherPreferences, getAdaptiveSuggestions, detectPatterns, predictScheduleSuccess, globalLearning, getTeacherStats, getAllStats, resetLearning } = require("./lib/aiLearningSystem");
const { autoGenerateSchedule, autoOptimizeSchedule } = require("./lib/aiAutoGeneration");
const { applyOptimizations, improveScheduleQuality } = require("./lib/autoOptimizer");

const app = express();
const port = process.env.PORT || 4000;
const ical = icalModule.default || icalModule;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

async function resolveInput(body) {
  if (body?.inputData?.courses?.length) {
    return normalizeInputData(body.inputData);
  }

  return parsePrompt(body?.prompt || demoPrompt);
}

function nextWeekday(targetDayIndex) {
  const now = new Date();
  const result = new Date(now);
  const diff = (targetDayIndex + 7 - now.getDay()) % 7 || 7;
  result.setDate(now.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function buildCalendar(schedule, calendarName = "ScheduleAI Timetable") {
  const calendar = ical({ name: calendarName });
  const dayIndex = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
  };

  for (const item of schedule.assignments || []) {
    const eventDate = nextWeekday(dayIndex[item.day]);
    const [hours, minutes] = item.time.split(":").map(Number);
    const start = new Date(eventDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    calendar.createEvent({
      start,
      end,
      summary: `${item.courseName} (${item.sections.join(", ")})`,
      description: `Faculty: ${item.faculty}\nRoom: ${item.room}`,
      location: item.room,
    });
  }

  return calendar;
}

app.get("/api/health", async (_req, res) => {
  const ollamaAvailable = await checkOllamaStatus();
  res.json({
    ok: true,
    name: "ScheduleAI API",
    ollamaEnabled: ollamaAvailable,
  });
});

app.get("/api/demo", (_req, res) => {
  res.json(buildDemoData());
});

app.get("/api/demo/schedule", (_req, res) => {
  // Return pre-generated hackathon demo schedule with the demo data
  const demoData = buildDemoData();
  const demoSchedule = getHackathonDemoSchedule();
  res.json({
    ...demoData,
    ...demoSchedule,
  });
});

app.get("/api/demo/full", (_req, res) => {
  // Complete test data: courses + pre-generated schedule
  const demoData = buildDemoData();
  const demoSchedule = getHackathonDemoSchedule();
  res.json({
    parsed: demoData,
    schedule: demoSchedule.schedule,
    summary: demoSchedule.summary,
  });
});

// ============= AI AUTO-GENERATION: FULL AUTONOMY =============

app.post("/api/generate/auto", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "prompt is required. Describe your scheduling needs in natural language." });
      return;
    }

    const result = await autoGenerateSchedule(prompt);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/optimize/auto", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length || !parsed) {
      res.status(400).json({ error: "schedule and parsed data are required" });
      return;
    }

    const result = await autoOptimizeSchedule(schedule, parsed);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============= AUTO-APPLY OPTIMIZATIONS: Improve & Regenerate =============

app.post("/api/optimize/apply", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length || !parsed) {
      res.status(400).json({ error: "schedule and parsed data are required" });
      return;
    }

    const result = await applyOptimizations(schedule, parsed);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/optimize/improve", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "schedule is required" });
      return;
    }

    const result = await improveScheduleQuality(schedule, parsed);
    res.json(result);
  } catch (error) {
    next(error);
  }
});


app.post("/api/parse", async (req, res, next) => {
  try {
    res.json(await resolveInput(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/schedule", async (req, res, next) => {
  try {
    const parsed = await resolveInput(req.body);
    const schedule = generateSchedule(parsed);

    res.json({
      parsed,
      schedule,
      summary: {
        source: parsed.source,
        headline: "Constraint-aware academic scheduler with explainable conflict intelligence",
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/substitute", (req, res, next) => {
  try {
    const schedule = req.body?.schedule;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule assignments are required before substitution." });
      return;
    }

    res.json(applySubstitution(schedule, req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/substitute/day", (req, res, next) => {
  try {
    const schedule = req.body?.schedule;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule assignments are required before substitution." });
      return;
    }

    res.json(autoSubstituteForDay(schedule, req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/export/ical", (req, res, next) => {
  try {
    const schedule = req.body?.schedule;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule assignments are required for iCal export." });
      return;
    }

    const calendar = buildCalendar(schedule, req.body?.calendarName);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=ScheduleAI.ics");
    res.send(calendar.toString());
  } catch (error) {
    next(error);
  }
});

app.post("/api/optimize/ai", async (req, res, next) => {
  try {
    const ollamaAvailable = await checkOllamaStatus();
    if (!ollamaAvailable) {
      res.json({
        suggestions: ["Start Ollama and pull a model (e.g., ollama pull neural-chat) to get AI-powered optimization suggestions."],
        analysis: "Ollama service not available at " + (process.env.OLLAMA_BASE_URL || "http://localhost:11434"),
      });
      return;
    }

    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule with assignments is required." });
      return;
    }

    // Analyze schedule for repetition patterns
    const timeSlotsByDay = {};
    const coursesByTimeSlot = {};
    
    for (const assignment of schedule.assignments || []) {
      const key = `${assignment.day}-${assignment.time}`;
      if (!timeSlotsByDay[assignment.day]) timeSlotsByDay[assignment.day] = [];
      timeSlotsByDay[assignment.day].push(assignment);
      
      if (!coursesByTimeSlot[key]) coursesByTimeSlot[key] = [];
      coursesByTimeSlot[key].push(assignment.courseName);
    }

    const summaryText = Object.entries(coursesByTimeSlot)
      .map(([slot, courses]) => `${slot}: ${courses.join(", ")}`)
      .join("\n");

    const userPrompt = `Analyze this academic schedule and provide 3-5 specific optimization suggestions to improve it. Focus on: (1) reducing repeated time slots for same courses, (2) better distribution across days, (3) maintaining 1-hour lunch break at 12:00-13:00, (4) spacing sessions with breaks.

Current Schedule by Time Slot:
${summaryText}

Provide actionable suggestions as a JSON array with "suggestion" and "reason" fields. Respond ONLY with valid JSON.`;

    const aiText = await callOllama(userPrompt, "You are an academic scheduling optimizer. Provide suggestions in JSON format only.");

    try {
      // Extract JSON from response
      const jsonMatch = aiText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiText;
      const suggestions = JSON.parse(jsonString);
      res.json({ suggestions, analysis: "Ollama-optimized recommendations generated." });
    } catch {
      res.json({
        suggestions: [{ suggestion: aiText, reason: "AI analysis generated" }],
        analysis: "Ollama analysis generated (parsed format).",
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============= OPTION B: SMART INPUT SUGGESTIONS =============

app.post("/api/suggest/course-requirements", async (req, res, next) => {
  try {
    const { courseName, faculty } = req.body;
    if (!courseName) {
      res.status(400).json({ error: "courseName is required" });
      return;
    }

    const suggestions = await suggestCourseRequirements(courseName, faculty || "General");
    res.json({ courseName, suggestions });
  } catch (error) {
    next(error);
  }
});

app.post("/api/suggest/room-assignment", async (req, res, next) => {
  try {
    const { courseType, studentCount, sessionType } = req.body;
    if (!courseType || !studentCount) {
      res.status(400).json({ error: "courseType and studentCount are required" });
      return;
    }

    const suggestions = await suggestRoomAssignment(courseType, studentCount, sessionType || "lecture");
    res.json({ suggestedRoom: suggestions });
  } catch (error) {
    next(error);
  }
});

app.post("/api/suggest/preferred-days", async (req, res, next) => {
  try {
    const { courseName, theoryHours } = req.body;
    if (!courseName || !theoryHours) {
      res.status(400).json({ error: "courseName and theoryHours are required" });
      return;
    }

    const suggestions = await suggestPreferredDays(courseName, theoryHours);
    res.json({ courseName, suggestedDays: suggestions });
  } catch (error) {
    next(error);
  }
});

app.post("/api/suggest/validate-course", async (req, res, next) => {
  try {
    const courseData = req.body?.courseData;
    if (!courseData) {
      res.status(400).json({ error: "courseData object is required" });
      return;
    }

    const validation = await validateCourseData(courseData);
    res.json({ courseData, validation });
  } catch (error) {
    next(error);
  }
});

// ============= OPTION C: DATA PARSING =============

app.post("/api/parse/text", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const parsed = await parseCoursesFromText(text);
    res.json({ source: "text", courses: parsed });
  } catch (error) {
    next(error);
  }
});

app.post("/api/parse/csv", async (req, res, next) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) {
      res.status(400).json({ error: "csvContent is required" });
      return;
    }

    const parsed = await parseCSVData(csvContent);
    res.json({ source: "csv", courses: parsed });
  } catch (error) {
    next(error);
  }
});

app.post("/api/parse/prompt", async (req, res, next) => {
  try {
    const { userPrompt } = req.body;
    if (!userPrompt) {
      res.status(400).json({ error: "userPrompt is required" });
      return;
    }

    const extracted = await extractCoursesFromPrompt(userPrompt);
    res.json({ source: "prompt", extracted });
  } catch (error) {
    next(error);
  }
});

// ============= OPTION D: SCHEDULE ANALYZER =============

app.post("/api/analyze/quality", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule with assignments is required" });
      return;
    }

    const analysis = await analyzeScheduleQuality(schedule, parsed);
    res.json({ quality: analysis });
  } catch (error) {
    next(error);
  }
});

app.post("/api/analyze/conflicts", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule with assignments is required" });
      return;
    }

    const conflicts = await detectConflicts(schedule, parsed);
    res.json({ conflicts });
  } catch (error) {
    next(error);
  }
});

app.post("/api/analyze/optimizations", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule with assignments is required" });
      return;
    }

    const optimizations = await suggestOptimizations(schedule, parsed);
    res.json({ optimizations });
  } catch (error) {
    next(error);
  }
});

app.post("/api/analyze/cost", async (req, res, next) => {
  try {
    const { schedule, parsed } = req.body;
    if (!schedule?.assignments?.length) {
      res.status(400).json({ error: "Schedule with assignments is required" });
      return;
    }

    const cost = await costAnalysis(schedule, parsed);
    res.json({ costAnalysis: cost });
  } catch (error) {
    next(error);
  }
});

// ============= OPTION E: LEARNING SYSTEM =============

app.post("/api/learn/record-preference", async (req, res, next) => {
  try {
    const { faculty, scheduleGeneration } = req.body;
    if (!faculty || !scheduleGeneration) {
      res.status(400).json({ error: "faculty and scheduleGeneration are required" });
      return;
    }

    const recorded = await recordTeacherPreferences(faculty, scheduleGeneration);
    res.json({ faculty, recorded });
  } catch (error) {
    next(error);
  }
});

app.post("/api/learn/adaptive-suggestions", async (req, res, next) => {
  try {
    const { faculty } = req.body;
    if (!faculty) {
      res.status(400).json({ error: "faculty is required" });
      return;
    }

    const suggestions = await getAdaptiveSuggestions(faculty);
    res.json({ faculty, suggestions });
  } catch (error) {
    next(error);
  }
});

app.post("/api/learn/detect-patterns", async (req, res, next) => {
  try {
    const { faculty } = req.body;
    if (!faculty) {
      res.status(400).json({ error: "faculty is required" });
      return;
    }

    const patterns = await detectPatterns(faculty);
    res.json({ faculty, patterns });
  } catch (error) {
    next(error);
  }
});

app.post("/api/learn/predict-success", async (req, res, next) => {
  try {
    const { faculty, proposedSchedule } = req.body;
    if (!faculty || !proposedSchedule) {
      res.status(400).json({ error: "faculty and proposedSchedule are required" });
      return;
    }

    const prediction = await predictScheduleSuccess(faculty, proposedSchedule);
    res.json({ faculty, prediction });
  } catch (error) {
    next(error);
  }
});

app.post("/api/learn/global-analysis", async (req, res, next) => {
  try {
    const { allSchedules } = req.body;
    if (!allSchedules || !Array.isArray(allSchedules)) {
      res.status(400).json({ error: "allSchedules array is required" });
      return;
    }

    const learnings = await globalLearning(allSchedules);
    res.json({ globalLearnings: learnings });
  } catch (error) {
    next(error);
  }
});

app.get("/api/learn/stats", (req, res, next) => {
  try {
    const stats = getAllStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

app.get("/api/learn/teacher-stats/:faculty", (req, res, next) => {
  try {
    const { faculty } = req.params;
    const stats = getTeacherStats(faculty);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

app.post("/api/learn/reset", (req, res, next) => {
  try {
    const { faculty } = req.body;
    const result = resetLearning(faculty);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============= ERROR HANDLER =============

app.use((error, _req, res, _next) => {
  res.status(500).json({
    error: "ScheduleAI hit an internal error.",
    detail: error.message,
  });
});

app.listen(port, () => {
  console.log(`ScheduleAI API listening on http://localhost:${port}`);
});
