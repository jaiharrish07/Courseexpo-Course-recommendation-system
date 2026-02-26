import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { BookOpen, Activity, Loader2, AlertCircle } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState({ profile: true, enrollments: true, progress: true });
  const [error, setError] = useState({ profile: null, enrollments: null, progress: null });

  useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch Profile Info
      try {
        setLoading(prev => ({ ...prev, profile: true }));
        const res = await api.get("/users/profile");
        setUser(res.data.user);
        setError(prev => ({ ...prev, profile: null }));
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(prev => ({ ...prev, profile: "Failed to load profile." }));
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }

      // Fetch Enrollments
      try {
        setLoading(prev => ({ ...prev, enrollments: true }));
        const enrollRes = await api.get("/enrollments/me");
        if (enrollRes.data.success) {
          setEnrollments(enrollRes.data.enrollments || []);
          setError(prev => ({ ...prev, enrollments: null }));
        } else {
          setError(prev => ({ ...prev, enrollments: enrollRes.data.message || "Failed to load enrollments." }));
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError(prev => ({ ...prev, enrollments: "Could not fetch enrollment data." }));
      } finally {
        setLoading(prev => ({ ...prev, enrollments: false }));
      }

      // Fetch Progress
      try {
        setLoading(prev => ({ ...prev, progress: true }));
        const progressRes = await api.get("/progress/summary");
        if (progressRes.data.success) {
          setProgress(progressRes.data.summary || progressRes.data.progress || []);
          setError(prev => ({ ...prev, progress: null }));
        } else {
          setError(prev => ({ ...prev, progress: progressRes.data.message || "Failed to load progress." }));
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError(prev => ({ ...prev, progress: "Could not fetch progress data." }));
      } finally {
        setLoading(prev => ({ ...prev, progress: false }));
      }
    };

    fetchProfileData();
  }, []);

  if (loading.profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error.profile && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-400 dark:bg-gray-900">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>{error.profile}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Profile Card */}
        {user && (
          <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-4">{user.name}</h2>
            <p className="text-center text-gray-300 mb-2">{user.email}</p>
            <p className="text-center text-sm text-gray-400">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Enrollments */}
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen /> My Enrollments
          </h3>
          {loading.enrollments && <Loader2 className="animate-spin" />}
          {error.enrollments && <p className="text-red-400">{error.enrollments}</p>}
          {!loading.enrollments && !error.enrollments && enrollments.length === 0 && (
            <p className="text-gray-400">You haven't enrolled in any courses yet.</p>
          )}
          {!loading.enrollments && !error.enrollments && enrollments.length > 0 && (
            <ul className="space-y-3">
              {enrollments.map((enroll) => (
                <li key={enroll.id || enroll.course_id} className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                  <span>{enroll.course_title || `Course ID: ${enroll.course_id}`}</span>
                  <span className="text-xs text-gray-400">
                    Enrolled: {new Date(enroll.enrolled_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Activity /> My Progress
          </h3>
          {loading.progress && <Loader2 className="animate-spin" />}
          {error.progress && <p className="text-red-400">{error.progress}</p>}
          {!loading.progress && !error.progress && progress.length === 0 && (
            <p className="text-gray-400">No progress tracked yet.</p>
          )}
          {!loading.progress && !error.progress && progress.length > 0 && (
            <ul className="space-y-4">
              {progress.map((prog) => (
                <li key={prog.enrollment_id || prog.course_id || prog.id} className="p-3 bg-white/5 rounded-lg">
                  <p className="font-medium mb-1">{prog.course_title || `Course ID: ${prog.course_id}`}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full"
                      style={{ width: `${prog.completion_percentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{prog.completion_percentage || 0}% Complete</p>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
