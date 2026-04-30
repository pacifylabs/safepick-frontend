"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import {
  UpdateChildPayload,
  UpdateChildPayloadSchema,
  Child,
} from '@/types/children.types';
import { useUpdateChild } from '@/hooks/useUpdateChild';

interface ChildEditFormProps {
  child: Child;
  onCancel: () => void;
  onSuccess: (updated: Child) => void;
}

const GRADES = [
  'Creche', 'Toddler', 'Nursery 1', 'Nursery 2',
  'KG 1', 'KG 2',
  'Primary 1', 'Primary 2', 'Primary 3',
  'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SS 1', 'SS 2', 'SS 3',
];

export function ChildEditForm({ child, onCancel, onSuccess }: ChildEditFormProps) {
  const { mutate, isPending, isError } = useUpdateChild(child.id);

  const form = useForm<UpdateChildPayload>({
    resolver: zodResolver(UpdateChildPayloadSchema),
    defaultValues: {
      fullName: child.fullName,
      grade: child.grade,
      dateOfBirth: child.dateOfBirth
        ? child.dateOfBirth.split('T')[0]
        : '',
      photoUrl: child.photoUrl ?? undefined,
    },
  });

  const handleCancel = () => {
    if (form.formState.isDirty) {
      const confirmed = window.confirm(
        'Discard unsaved changes?'
      );
      if (!confirmed) return;
    }
    onCancel();
  };

  const handleSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: (updated) => {
        onSuccess(updated);
      },
    });
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between p-5 border-b border-[rgba(11,26,44,0.07)]">
        <h2 className="font-serif text-[1rem] font-semibold text-[#0B1A2C]">
          Edit {child.fullName.split(' ')[0]}
        </h2>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-[var(--bg-muted)] rounded-lg transition-colors"
        >
          <X className="w-4 h-4 stroke-[#6B7280]" />
        </button>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* PHOTO FIELD */}
        <div className="flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full mx-auto mb-3 bg-[#1D9E75] flex items-center justify-center text-white overflow-hidden">
            {child.photoUrl ? (
              <img
                src={child.photoUrl}
                alt={child.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-[1.5rem] font-semibold">
                {child.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <button
            type="button"
            className="text-[0.72rem] text-[#0FA37F] hover:underline"
          >
            Change photo
          </button>
        </div>

        {/* FULL NAME FIELD */}
        <div className="space-y-1.5">
          <label className="font-body text-[0.72rem] font-medium text-[#6B7280] uppercase tracking-[0.06em]">
            Full name
          </label>
          <input
            {...form.register('fullName')}
            type="text"
            className="w-full bg-[#F2F0EB] border border-[rgba(11,26,44,0.07)] rounded-[10px] px-4 py-[10px] font-body text-[0.875rem] text-[#0B1A2C] focus:outline-none focus:border-[#0FA37F] focus:ring-1 focus:ring-[#0FA37F]"
          />
          {form.formState.errors.fullName && (
            <p className="font-body text-[0.72rem] text-[#D85A30] mt-1">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        {/* GRADE FIELD */}
        <div className="space-y-1.5">
          <label className="font-body text-[0.72rem] font-medium text-[#6B7280] uppercase tracking-[0.06em]">
            Grade
          </label>
          <select
            {...form.register('grade')}
            className="w-full bg-[#F2F0EB] border border-[rgba(11,26,44,0.07)] rounded-[10px] px-4 py-[10px] font-body text-[0.875rem] text-[#0B1A2C] focus:outline-none focus:border-[#0FA37F] focus:ring-1 focus:ring-[#0FA37F]"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {form.formState.errors.grade && (
            <p className="font-body text-[0.72rem] text-[#D85A30] mt-1">
              {form.formState.errors.grade.message}
            </p>
          )}
        </div>

        {/* DATE OF BIRTH FIELD */}
        <div className="space-y-1.5">
          <label className="font-body text-[0.72rem] font-medium text-[#6B7280] uppercase tracking-[0.06em]">
            Date of birth
          </label>
          <input
            {...form.register('dateOfBirth')}
            type="date"
            max={today}
            className="w-full bg-[#F2F0EB] border border-[rgba(11,26,44,0.07)] rounded-[10px] px-4 py-[10px] font-body text-[0.875rem] text-[#0B1A2C] focus:outline-none focus:border-[#0FA37F] focus:ring-1 focus:ring-[#0FA37F]"
          />
          {form.formState.errors.dateOfBirth && (
            <p className="font-body text-[0.72rem] text-[#D85A30] mt-1">
              {form.formState.errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* ERROR BANNER */}
        {isError && (
          <div className="bg-[#FAECE7] rounded-[10px] p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 stroke-[#D85A30]" />
            <p className="font-body text-[0.78rem] text-[#D85A30]">
              Could not save changes. Please try again.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-5 border-t border-[rgba(11,26,44,0.07)] flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 bg-[#F2F0EB] text-[#0B1A2C] rounded-[10px] py-[11px] font-body text-[0.82rem] font-medium cursor-pointer hover:bg-[#E8E6E1]"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 bg-[#0FA37F] text-white rounded-[10px] py-[11px] font-body text-[0.82rem] font-medium cursor-pointer hover:bg-[#0d9472] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </div>
  );
}
