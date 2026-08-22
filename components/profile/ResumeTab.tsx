'use client';

import React, { useState } from 'react';
import { 
  ResumeData, 
  Skill, 
  Certification, 
  SkillLevel 
} from '@/lib/types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Award, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  Save, 
  BookOpen, 
  Heart, 
  Compass, 
  ShieldAlert 
} from 'lucide-react';

interface ResumeTabProps {
  resume: ResumeData;
  canEdit: boolean;
  onUpdateResume: (updatedResume: ResumeData) => Promise<void>;
}

export default function ResumeTab({
  resume,
  canEdit,
  onUpdateResume,
}: ResumeTabProps) {
  // Bio/Text fields local state
  const [about, setAbout] = useState(resume.about || '');
  const [whatILove, setWhatILove] = useState(resume.whatILoveAboutJob || '');
  const [interests, setInterests] = useState(resume.interestsAndHobbies || '');

  // Skills & Certs local state
  const [skills, setSkills] = useState<Skill[]>(resume.skills || []);
  const [certifications, setCertifications] = useState<Certification[]>(resume.certifications || []);

  // Skill Add Modal / Inline state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Cert Add Modal / Inline state
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCert, setNewCert] = useState<Partial<Certification>>({
    name: '',
    issuingOrg: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  const [savingBio, setSavingBio] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Save Text Fields
  const handleSaveBio = async () => {
    setSavingBio(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated: ResumeData = {
        about,
        whatILoveAboutJob: whatILove,
        interestsAndHobbies: interests,
        skills,
        certifications,
      };
      await onUpdateResume(updated);
      setSuccessMsg('Resume details saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save resume details');
    } finally {
      setSavingBio(false);
    }
  };

  // Add or Update Skill
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = newSkillName.trim();
    if (!trimmedName) {
      setErrorMsg('Skill name cannot be empty');
      return;
    }

    // Check duplicate skill name (ignoring case)
    const isDuplicate = skills.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase() && s.id !== editingSkillId
    );

    if (isDuplicate) {
      setErrorMsg(`Skill "${trimmedName}" already exists. Duplicate skills are not allowed.`);
      return;
    }

    let updatedSkills: Skill[];
    if (editingSkillId) {
      updatedSkills = skills.map((s) =>
        s.id === editingSkillId
          ? { ...s, name: trimmedName, level: newSkillLevel, category: newSkillCategory }
          : s
      );
    } else {
      const newSkill: Skill = {
        id: `skill-${Date.now()}`,
        name: trimmedName,
        level: newSkillLevel,
        category: newSkillCategory,
      };
      updatedSkills = [...skills, newSkill];
    }

    setSkills(updatedSkills);
    setNewSkillName('');
    setEditingSkillId(null);

    try {
      await onUpdateResume({
        about,
        whatILoveAboutJob: whatILove,
        interestsAndHobbies: interests,
        skills: updatedSkills,
        certifications,
      });
      setSuccessMsg('Skills updated!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update skills');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    const updatedSkills = skills.filter((s) => s.id !== id);
    setSkills(updatedSkills);
    try {
      await onUpdateResume({
        about,
        whatILoveAboutJob: whatILove,
        interestsAndHobbies: interests,
        skills: updatedSkills,
        certifications,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete skill');
    }
  };

  // Add Certification
  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newCert.name?.trim() || !newCert.issuingOrg?.trim() || !newCert.issueDate) {
      setErrorMsg('Certification Name, Issuing Organization, and Issue Date are required');
      return;
    }

    const createdCert: Certification = {
      id: `cert-${Date.now()}`,
      name: newCert.name.trim(),
      issuingOrg: newCert.issuingOrg.trim(),
      issueDate: newCert.issueDate,
      expiryDate: newCert.expiryDate?.trim() || undefined,
      credentialId: newCert.credentialId?.trim() || undefined,
      credentialUrl: newCert.credentialUrl?.trim() || undefined,
    };

    const updatedCerts = [...certifications, createdCert];
    setCertifications(updatedCerts);
    setIsAddingCert(false);
    setNewCert({
      name: '',
      issuingOrg: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });

    try {
      await onUpdateResume({
        about,
        whatILoveAboutJob: whatILove,
        interestsAndHobbies: interests,
        skills,
        certifications: updatedCerts,
      });
      setSuccessMsg('Certification added successfully!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save certification');
    }
  };

  const handleDeleteCert = async (id: string) => {
    const updatedCerts = certifications.filter((c) => c.id !== id);
    setCertifications(updatedCerts);
    try {
      await onUpdateResume({
        about,
        whatILoveAboutJob: whatILove,
        interestsAndHobbies: interests,
        skills,
        certifications: updatedCerts,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete certification');
    }
  };

  const getLevelBadgeColor = (level: SkillLevel) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Advanced':
        return 'bg-blue-100 text-brand-primary border-blue-200';
      case 'Intermediate':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Beginner':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: 3 Story / Bio Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. About */}
        <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-brand-tint text-brand-primary rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-text">About Me</h3>
            </div>
            {canEdit ? (
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={5}
                placeholder="Share a short bio summarizing your background, mindset and strengths..."
                className="w-full text-sm p-3 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none text-brand-text bg-brand-bg/50"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60 min-h-[120px]">
                {about || <span className="italic text-brand-muted">No description provided yet.</span>}
              </p>
            )}
          </div>
        </div>

        {/* 2. What I Love About My Job */}
        <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-text">What I Love About My Job</h3>
            </div>
            {canEdit ? (
              <textarea
                value={whatILove}
                onChange={(e) => setWhatILove(e.target.value)}
                rows={5}
                placeholder="What motivates you at work? What problems do you enjoy tackling most?"
                className="w-full text-sm p-3 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none text-brand-text bg-brand-bg/50"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60 min-h-[120px]">
                {whatILove || <span className="italic text-brand-muted">No details provided yet.</span>}
              </p>
            )}
          </div>
        </div>

        {/* 3. Interests & Hobbies */}
        <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-50 text-brand-warning rounded-xl">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-text">Interests & Hobbies</h3>
            </div>
            {canEdit ? (
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                rows={5}
                placeholder="Favorite books, outdoor activities, sports, side projects..."
                className="w-full text-sm p-3 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none text-brand-text bg-brand-bg/50"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60 min-h-[120px]">
                {interests || <span className="italic text-brand-muted">No interests listed yet.</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button for Bio Sections */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveBio}
            disabled={savingBio}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{savingBio ? 'Saving...' : 'Save Resume Bio'}</span>
          </button>
        </div>
      )}

      {/* Skills Card */}
      <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-tint text-brand-primary rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-text">Skills & Competencies</h3>
              <p className="text-xs text-brand-muted">Categorized skill set with proficiency metrics</p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-brand-bg rounded-full border border-brand-border text-brand-muted">
            {skills.length} {skills.length === 1 ? 'Skill' : 'Skills'} Listed
          </span>
        </div>

        {/* Add / Edit Skill Form (if canEdit) */}
        {canEdit && (
          <form onSubmit={handleSaveSkill} className="mb-6 p-4 bg-brand-bg rounded-xl border border-brand-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3">
              {editingSkillId ? 'Edit Skill' : 'Add New Skill'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Python, PostgreSQL, System Design..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-brand-text"
                />
              </div>

              <div>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-brand-text"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingSkillId ? 'Update' : 'Add'}</span>
                </button>

                {editingSkillId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkillId(null);
                      setNewSkillName('');
                    }}
                    className="px-3 py-2 bg-white border border-brand-border rounded-lg text-xs font-medium text-brand-muted hover:text-brand-text"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Skills Tag Cloud */}
        {skills.length === 0 ? (
          <div className="text-center py-8 bg-brand-bg/50 rounded-xl border border-dashed border-brand-border">
            <Sparkles className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm text-brand-muted">No skills listed yet.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-white border border-brand-border shadow-sm hover:border-brand-sky/60 transition-all group"
              >
                <span className="text-sm font-semibold text-brand-text">{skill.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeColor(skill.level)}`}>
                  {skill.level}
                </span>

                {canEdit && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-1 pl-1 border-l border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkillId(skill.id);
                        setNewSkillName(skill.name);
                        setNewSkillLevel(skill.level);
                        setNewSkillCategory(skill.category || 'Technical');
                      }}
                      className="p-1 hover:text-brand-primary text-gray-400 rounded"
                      title="Edit Skill"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1 hover:text-red-600 text-gray-400 rounded"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Card */}
      <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-brand-warning rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-text">Certifications & Licenses</h3>
              <p className="text-xs text-brand-muted">Verified credentials, professional courses & badges</p>
            </div>
          </div>

          {canEdit && !isAddingCert && (
            <button
              onClick={() => setIsAddingCert(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-tint hover:bg-brand-sky/20 text-brand-primary rounded-xl text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          )}
        </div>

        {/* Add Certification Form */}
        {isAddingCert && (
          <form onSubmit={handleSaveCert} className="mb-6 p-5 bg-brand-bg rounded-xl border border-brand-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">
              Add Professional Certification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Certification Name *</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services, Scrum Alliance, Meta"
                  value={newCert.issuingOrg}
                  onChange={(e) => setNewCert({ ...newCert, issuingOrg: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Credential ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AWS-PSA-12345"
                  value={newCert.credentialId}
                  onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Verification URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCert.credentialUrl}
                  onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCert(false)}
                className="px-4 py-2 text-xs font-medium text-brand-muted hover:text-brand-text bg-white border border-brand-border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Save Certification
              </button>
            </div>
          </form>
        )}

        {/* Certifications List */}
        {certifications.length === 0 ? (
          <div className="text-center py-8 bg-brand-bg/50 rounded-xl border border-dashed border-brand-border">
            <Award className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm text-brand-muted">No certifications added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-white border border-brand-border shadow-sm flex items-start justify-between gap-3 hover:border-brand-sky/60 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-brand-warning rounded-lg shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-text">{cert.name}</h4>
                    <p className="text-xs font-medium text-brand-muted">{cert.issuingOrg}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500">
                      <span>Issued: {cert.issueDate}</span>
                      {cert.expiryDate && <span>• Expires: {cert.expiryDate}</span>}
                      {cert.credentialId && <span>• ID: {cert.credentialId}</span>}
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline mt-2"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <button
                    onClick={() => handleDeleteCert(cert.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Certification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
