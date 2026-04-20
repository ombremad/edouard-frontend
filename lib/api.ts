import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "./constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.edouard.tf";

type AuthHandlers = {
  getToken: () => string | null;
  onUnauthorized: () => void;
};

let handlers: AuthHandlers = {
  getToken: () => null,
  onUnauthorized: () => {},
};

export function setAuthHandlers(next: AuthHandlers) {
  handlers = next;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = handlers.getToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401) {
    handlers.onUnauthorized();
    throw new Error("Session expirée");
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const get = <T>(path: string) => apiFetch<T>(path);
const post = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const patch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del = <T>(path: string) => apiFetch<T>(path, { method: "DELETE" });
const postForm = <T>(path: string, body: FormData) =>
  apiFetch<T>(path, { method: "POST", body });
const patchForm = <T>(path: string, body: FormData) =>
  apiFetch<T>(path, { method: "PATCH", body });

// --- Types ---

export interface LoginDto {
  email: string;
  password: string;
}

export type UserRole = "USER" | "ADMIN" | "SUPERADMIN";

export interface GetUserDto {
  id: string;
  email: string;
  role: UserRole;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
}

interface GetPersonDto {
  name: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export interface GetPersonDetailsDto {
  id: string;
  name: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  isDead: boolean;
  birthDate: string;
  deathDate?: string;
  age?: number;
  ageAtDeath?: number;
  daysSinceDeath?: number;
}

export type GetPersonDetailsWithStatsDto = GetPersonDetailsDto;

export interface CreatePersonDto {
  name: string;
  title: string;
  subtitle?: string;
  birthDate: string;
  deathDate?: string;
  image: File;
}

export interface UpdatePersonDto {
  name?: string;
  title?: string;
  subtitle?: string;
  birthDate?: string;
  deathDate?: string;
  image?: File;
}

export type ReportType = "IS_NOT_ALIVE" | "WRONG_IMAGE" | "WRONG_DESCRIPTION";

export interface GetReportDto {
  id: string;
  user: GetUserDto;
  person: GetPersonDetailsDto;
  type: ReportType;
}

export interface GameMetaDto {
  gameId: string;
  currentQuestion: number;
  questionsNumber: number;
  score: number;
}

export interface GetGameQuestionDto {
  meta: GameMetaDto;
  person: GetPersonDto;
}

export interface GetGameAnswerDto {
  meta: GameMetaDto;
  correct: boolean;
  person: GetPersonDetailsDto;
}

export interface GetGameResultsDto {
  questionsNumber: number;
  score: number;
  correctPercentage: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalItemsCount: number;
  totalPagesCount: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PeopleStatsDto {
  total: number;
  dead: number;
  alive: number;
  deadRatio: number;
}

// --- Auth ---

export const login = (dto: LoginDto) =>
  post<{ access_token: string }>("/auth/login", dto);

// --- Game ---

export const startGame = (length: number) =>
  post<GetGameQuestionDto>("/game/start", { length });

export const answerQuestion = (gameId: string, isDead: boolean) =>
  post<GetGameAnswerDto>("/game/answer", { gameId, isDead });

export const nextQuestion = (gameId: string) =>
  post<GetGameQuestionDto>("/game/next", { gameId });

export const endGame = (gameId: string) =>
  post<GetGameResultsDto>("/game/end", { gameId });

// --- People ---

export function getPeople(page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return get<PaginatedResponse<GetPersonDetailsDto>>(`/people?${qs}`);
}

export const getPerson = (personId: string) =>
  get<GetPersonDetailsWithStatsDto>(`/people/${personId}`);

function personFormData(dto: CreatePersonDto | UpdatePersonDto): FormData {
  const body = new FormData();
  if (dto.name !== undefined) body.append("name", dto.name);
  if (dto.title !== undefined) body.append("title", dto.title);
  if (dto.subtitle !== undefined) body.append("subtitle", dto.subtitle);
  if (dto.birthDate !== undefined) body.append("birthDate", dto.birthDate);
  if (dto.deathDate !== undefined) body.append("deathDate", dto.deathDate);
  if (dto.image) body.append("image", dto.image);
  return body;
}

export const createPerson = (dto: CreatePersonDto) =>
  postForm<GetPersonDetailsDto>("/people", personFormData(dto));

export const updatePerson = (personId: string, dto: UpdatePersonDto) =>
  patchForm<GetPersonDetailsWithStatsDto>(
    `/people/${personId}`,
    personFormData(dto)
  );

export const deletePerson = (personId: string) =>
  del<void>(`/people/${personId}`);

export const getPeopleStats = () => get<PeopleStatsDto>("/people/stats");

// --- Users ---

export function getUsers(page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return get<PaginatedResponse<GetUserDto>>(`/users?${qs}`);
}

export const createUser = (dto: CreateUserDto) =>
  post<GetUserDto>("/users", dto);

export const updateUser = (userId: string, dto: UpdateUserDto) =>
  patch<GetUserDto>(`/users/${userId}`, dto);

export const deleteUser = (userId: string) =>
  del<GetUserDto>(`/users/${userId}`);

// --- Reports ---

export const createReport = (personId: string, type: ReportType) =>
  post<GetReportDto>(`/reports/${personId}`, { type });

export function getReports(page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return get<PaginatedResponse<GetReportDto>>(`/reports?${qs}`);
}

export const deleteReport = (reportId: string) =>
  del<void>(`/reports/${reportId}`);
