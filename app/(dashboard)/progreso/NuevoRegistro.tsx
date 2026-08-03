"use client";

import { useState } from "react";
import {
  Plus,
  Scale,
  Ruler,
  Activity,
  Dumbbell,
  Droplets,
  Flame,
  Zap,
  Heart,
  Target,
  RulerIcon,
  Armchair,
  Clipboard,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function NuevoRegistro() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    weight: "",
    height: "",
    bodyFatPercent: "",
    musclePercent: "",
    waterPercent: "",
    visceralFat: "",
    basalMetabolism: "",
    metabolicAge: "",
    waist: "",
    hip: "",
    arm: "",
    chest: "",
    targetWeight: "",
    notes: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.weight) {
      alert("El peso es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(form.weight),
          height: form.height ? parseFloat(form.height) : null,
          bodyFatPercent: form.bodyFatPercent ? parseFloat(form.bodyFatPercent) : null,
          musclePercent: form.musclePercent ? parseFloat(form.musclePercent) : null,
          waterPercent: form.waterPercent ? parseFloat(form.waterPercent) : null,
          visceralFat: form.visceralFat ? parseInt(form.visceralFat) : null,
          basalMetabolism: form.basalMetabolism ? parseInt(form.basalMetabolism) : null,
          metabolicAge: form.metabolicAge ? parseInt(form.metabolicAge) : null,
          waist: form.waist ? parseFloat(form.waist) : null,
          hip: form.hip ? parseFloat(form.hip) : null,
          arm: form.arm ? parseFloat(form.arm) : null,
          chest: form.chest ? parseFloat(form.chest) : null,
          targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
          notes: form.notes || null,
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-zinc-700";
  const labelClass = "block text-xs text-zinc-400 mb-1.5 font-medium";

  const fields = [
    { key: "weight", label: "Peso (kg)", icon: Scale, required: true, placeholder: "70.5", step: "0.1" },
    { key: "height", label: "Altura (cm)", icon: Ruler, placeholder: "175", step: "0.1" },
    { key: "bodyFatPercent", label: "% Grasa", icon: Activity, placeholder: "15.5", step: "0.1" },
    { key: "musclePercent", label: "% Músculo", icon: Dumbbell, placeholder: "45.2", step: "0.1" },
    { key: "waterPercent", label: "% Agua", icon: Droplets, placeholder: "55.0", step: "0.1" },
    { key: "visceralFat", label: "Grasa visceral", icon: Flame, placeholder: "5", step: "1" },
    { key: "basalMetabolism", label: "Metab. basal (kcal)", icon: Zap, placeholder: "1800", step: "1" },
    { key: "metabolicAge", label: "Edad metabólica", icon: Heart, placeholder: "25", step: "1" },
    { key: "waist", label: "Cintura (cm)", icon: RulerIcon, placeholder: "80", step: "0.1" },
    { key: "hip", label: "Cadera (cm)", icon: RulerIcon, placeholder: "95", step: "0.1" },
    { key: "arm", label: "Brazo (cm)", icon: Armchair, placeholder: "32", step: "0.1" },
    { key: "chest", label: "Pecho (cm)", icon: Armchair, placeholder: "100", step: "0.1" },
    { key: "targetWeight", label: "Peso objetivo (kg)", icon: Target, placeholder: "68.0", step: "0.1" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Plus size={18} className="text-blue-400" />
          </div>
          <div>
            <span className="font-semibold text-white block">Nuevo Registro</span>
            <span className="text-xs text-zinc-500">Completá tus medidas actuales</span>
          </div>
        </div>
        {open ? (
          <ChevronUp size={20} className="text-zinc-500" />
        ) : (
          <ChevronDown size={20} className="text-zinc-500" />
        )}
      </button>

      {/* Formulario */}
      {open && (
        <form onSubmit={handleSubmit} className="p-5 border-t border-zinc-800">
          {/* Grid de campos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className={labelClass}>
                    <Icon size={12} className="inline mr-1.5 text-zinc-500" />
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type="number"
                    step={field.step}
                    required={field.required}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className={inputClass}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            })}
          </div>

          {/* Notas */}
          <div className="mb-5">
            <label className={labelClass}>
              <Clipboard size={12} className="inline mr-1.5 text-zinc-500" />
              Notas
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Observaciones, sensaciones, etc."
            />
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Guardar registro
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}