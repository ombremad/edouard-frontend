"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPeople,
  getPeopleStats,
  createPerson,
  updatePerson,
  deletePerson,
  GetPersonDetailsDto,
  CreatePersonDto,
  UpdatePersonDto,
  PeopleStatsDto,
  PaginationMeta,
} from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { errorMessage } from "@/lib/errors";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { FieldLabel, FieldInput } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowAction } from "@/components/ui/RowAction";

type PersonForm = {
  name: string;
  title: string;
  subtitle: string;
  birthDate: string;
  deathDate: string;
  image: File | null;
};

const EMPTY_FORM: PersonForm = {
  name: "",
  title: "",
  subtitle: "",
  birthDate: "",
  deathDate: "",
  image: null,
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type ModalKind = "create" | "edit" | "delete" | null;

const DATE_DISPLAY_RE = /^(\d{2})-(\d{2})-(\d{4})$/;

function isoToDisplay(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

function displayToIso(display: string): string | null {
  const match = DATE_DISPLAY_RE.exec(display.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date.toISOString();
}

function buildCreateDto(form: PersonForm, image: File): CreatePersonDto {
  return {
    name: form.name,
    title: form.title,
    birthDate: displayToIso(form.birthDate) ?? "",
    image,
    ...(form.subtitle ? { subtitle: form.subtitle } : {}),
    ...(form.deathDate ? { deathDate: displayToIso(form.deathDate) ?? "" } : {}),
  };
}

function buildUpdateDto(
  form: PersonForm,
  original: GetPersonDetailsDto
): UpdatePersonDto {
  const dto: UpdatePersonDto = {};

  if (form.name !== original.name) dto.name = form.name;
  if (form.title !== original.title) dto.title = form.title;

  const formSubtitle = form.subtitle;
  const originalSubtitle = original.subtitle ?? "";
  if (formSubtitle !== originalSubtitle) dto.subtitle = formSubtitle;

  const formBirthIso = displayToIso(form.birthDate);
  if (formBirthIso && formBirthIso !== original.birthDate) {
    dto.birthDate = formBirthIso;
  }

  const formDeathIso = form.deathDate ? displayToIso(form.deathDate) : "";
  const originalDeath = original.deathDate ?? "";
  if ((formDeathIso ?? "") !== originalDeath) {
    dto.deathDate = formDeathIso ?? "";
  }

  if (form.image) dto.image = form.image;

  return dto;
}

export default function PeopleTable() {
  const [people, setPeople] = useState<GetPersonDetailsDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<PeopleStatsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [selected, setSelected] = useState<GetPersonDetailsDto | null>(null);
  const [form, setForm] = useState<PersonForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getPeople(page, DEFAULT_PAGE_SIZE);
      setPeople(response.data ?? []);
      setPagination(response.pagination ?? null);
    } catch (cause) {
      setLoadError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getPeopleStats()
      .then(setStats)
      .catch((cause) => console.warn("stats load failed", cause));
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setModal("create");
  }

  function openEdit(person: GetPersonDetailsDto) {
    setSelected(person);
    setForm({
      name: person.name,
      title: person.title,
      subtitle: person.subtitle ?? "",
      birthDate: isoToDisplay(person.birthDate),
      deathDate: isoToDisplay(person.deathDate),
      image: null,
    });
    setError("");
    setModal("edit");
  }

  function openDelete(person: GetPersonDetailsDto) {
    setSelected(person);
    setModal("delete");
  }

  async function handleSave(kind: "create" | "edit") {
    if (!form.birthDate) {
      setError("La date de naissance est obligatoire.");
      return;
    }
    if (displayToIso(form.birthDate) === null) {
      setError("Date de naissance invalide (JJ-MM-AAAA).");
      return;
    }
    if (form.deathDate && displayToIso(form.deathDate) === null) {
      setError("Date de décès invalide (JJ-MM-AAAA).");
      return;
    }
    if (kind === "create" && !form.image) {
      setError("Une image est obligatoire (jpg, png ou webp, 2 Mo max).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (kind === "create" && form.image) {
        await createPerson(buildCreateDto(form, form.image));
      } else if (selected) {
        const dto = buildUpdateDto(form, selected);
        if (Object.keys(dto).length > 0) {
          await updatePerson(selected.id, dto);
        }
      }
      setModal(null);
      load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await deletePerson(selected.id);
      setModal(null);
      load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  const totalPages = pagination?.totalPagesCount ?? 0;

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Décédé·e·s", value: stats.dead },
            { label: "En vie", value: stats.alive },
            { label: "Taux de décès", value: `${stats.deadRatio}%` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
              <span className="text-gray-900 dark:text-white text-2xl font-semibold">{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personnes ({pagination?.totalItemsCount ?? 0})</h2>
        <Button onClick={openCreate} className="px-4 py-2 text-sm">
          + Ajouter une personne
        </Button>
      </div>

      {loadError && (
        <p className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300 text-sm">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[28%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Âge</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-gray-100 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3 truncate font-medium text-gray-900 dark:text-white">{person.name}</td>
                  <td className="px-4 py-3 truncate text-gray-500 dark:text-gray-400">{person.title}</td>
                  <td className="px-4 py-3 truncate">
                    <StatusBadge variant={person.isDead ? "dead" : "alive"}>
                      {person.isDead ? "Décédé·e" : "En vie"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 truncate text-gray-500 dark:text-gray-400">
                    {person.isDead ? person.ageAtDeath : person.age}
                  </td>
                  <td className="px-4 py-3 truncate text-right space-x-2">
                    <RowAction onClick={() => openEdit(person)}>Modifier</RowAction>
                    <RowAction variant="danger" onClick={() => openDelete(person)}>Supprimer</RowAction>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Ajouter une personne" : "Modifier une personne"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <div>
              <FieldLabel compact>Nom *</FieldLabel>
              <FieldInput
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <FieldLabel compact>Titre *</FieldLabel>
              <FieldInput
                type="text"
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <FieldLabel compact>Sous-titre</FieldLabel>
              <FieldInput
                type="text"
                value={form.subtitle ?? ""}
                onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <FieldLabel compact>Date de naissance *</FieldLabel>
              <FieldInput
                type="text"
                inputMode="numeric"
                required
                placeholder="JJ-MM-AAAA"
                pattern="\d{2}-\d{2}-\d{4}"
                maxLength={10}
                value={form.birthDate}
                onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <FieldLabel compact>Date de décès</FieldLabel>
              <FieldInput
                type="text"
                inputMode="numeric"
                placeholder="JJ-MM-AAAA"
                pattern="\d{2}-\d{2}-\d{4}"
                maxLength={10}
                value={form.deathDate ?? ""}
                onChange={(event) => setForm({ ...form, deathDate: event.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <FieldLabel compact>
                {modal === "create"
                  ? "Image *"
                  : "Image (laisser vide pour conserver l’actuelle)"}
              </FieldLabel>
              <FieldInput
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.files?.[0] ?? null })
                }
                className="text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                jpg, jpeg, png ou webp — 2 Mo max.
              </p>
            </div>
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <Button
              onClick={() => handleSave(modal)}
              disabled={saving}
              className="w-full py-2 text-sm"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Supprimer une personne" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Supprimer{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{selected.name}</span> ?
              Cette action est irréversible.
            </p>
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setModal(null)} className="flex-1 py-2 text-sm">
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={saving} className="flex-1 py-2 text-sm">
                {saving ? "Suppression…" : "Supprimer"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
