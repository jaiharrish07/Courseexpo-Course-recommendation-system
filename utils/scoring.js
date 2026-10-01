// utils/scoring.js

function toNumber(v, fallback = 0) {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function containsIgnoreCase(text = "", query = "") {
  return String(text || "").toLowerCase().includes(String(query || "").toLowerCase());
}

/**
 * Score a single course based on user preferences
 */
function scoreCourse(course, preferences = {}, maxRatingCount = 1) {
  const coursePrice = toNumber(course.price, 0);
  const courseRating = toNumber(course.rating, 0);
  const ratingCount = toNumber(course.rating_count, 0);

  // === Filtering stage ===
  if (preferences.price_min != null && coursePrice < toNumber(preferences.price_min)) return null;
  if (preferences.price_max != null && coursePrice > toNumber(preferences.price_max)) return null;
  if (preferences.wants_certificate && !course.certification) return null;
  if (
    preferences.desired_level &&
    (!course.level ||
      String(course.level).toLowerCase() !==
        String(preferences.desired_level).toLowerCase())
  )
    return null;
  if (preferences.domain) {
    const domainMatch =
      containsIgnoreCase(course.title, preferences.domain) ||
      containsIgnoreCase(course.category, preferences.domain) ||
      containsIgnoreCase(course.description, preferences.domain);
    if (!domainMatch) return null;
  }

  // === Scoring stage ===
  let score = 0;
  const details = {};
  const reasons = [];

  if (
    preferences.price_max != null &&
    coursePrice <= toNumber(preferences.price_max)
  ) {
    score += 20;
    details.price = 20;
    reasons.push("Within price range");
  }

  if (preferences.wants_certificate && course.certification) {
    score += 15;
    details.certification = 15;
    reasons.push("Certification included");
  }

  if (preferences.domain) {
    if (
      containsIgnoreCase(course.title, preferences.domain) ||
      containsIgnoreCase(course.category, preferences.domain) ||
      containsIgnoreCase(course.description, preferences.domain)
    ) {
      score += 25;
      details.domain = 25;
      reasons.push("Matches preferred domain");
    }
  }

  if (courseRating >= 4.5) {
    score += 20;
    details.rating = 20;
    reasons.push("Excellent rating");
  } else if (courseRating >= 4.0) {
    score += 10;
    details.rating = 10;
    reasons.push("Good rating");
  }

  if (ratingCount > 0 && maxRatingCount > 0) {
    const popularityScore = Math.round((ratingCount / maxRatingCount) * 20);
    score += popularityScore;
    details.popularity = popularityScore;
    if (popularityScore > 0) reasons.push("Popular among learners");
  }

  return {
    rule_score: score,
    score_details: details,
    reasons,
  };
}

/**
 * Rank all courses and return sorted array
 */
function rankCourses(courses = [], preferences = {}) {
  const maxRatingCount = Math.max(
    ...courses.map((c) => toNumber(c.rating_count, 0)),
    1
  );

  const ranked = courses
    .map((course) => {
      const r = scoreCourse(course, preferences, maxRatingCount);
      if (!r) return null;
      return { ...course, ...r };
    })
    .filter(Boolean)
    .sort((a, b) => b.rule_score - a.rule_score);

  // fallback if filters exclude everything
  if (ranked.length === 0) {
    console.warn("⚠️ No rule-based matches found. Returning all courses unfiltered.");
    return courses.map((c) => ({ ...c, rule_score: 0, reasons: [] }));
  }

  return ranked;
}

module.exports = { scoreCourse, rankCourses };

