import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as termService from '../services/term.service';
import {
  getTermHandler,
  listTermsAdminHandler,
  listTermsHandler,
  updateTermHandler,
} from './term.controller';

vi.mock('../services/term.service', () => ({
  listTerms: vi.fn().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
  getTermByKey: vi.fn().mockResolvedValue({ key: 'left_ventricle' }),
  createTerm: vi.fn(),
  updateTerm: vi.fn(),
}));

function fakeRes(): Response {
  return { json: vi.fn(), status: vi.fn().mockReturnThis() } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('student-facing term reads', () => {
  it('list only asks the service for verified terms', async () => {
    const req = { query: {} } as unknown as Request;
    const res = fakeRes();
    const next = vi.fn() as unknown as NextFunction;

    await listTermsHandler(req, res, next);

    expect(termService.listTerms).toHaveBeenCalledWith({ page: 1, limit: 20 }, { onlyVerified: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('single term read keeps the verified gate', async () => {
    const req = { params: { key: 'left_ventricle' } } as unknown as Request;
    const res = fakeRes();
    const next = vi.fn() as unknown as NextFunction;

    await getTermHandler(req, res, next);

    expect(termService.getTermByKey).toHaveBeenCalledWith('left_ventricle', { onlyVerified: true });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('admin term reads', () => {
  it('list does not restrict status', async () => {
    const req = { query: {} } as unknown as Request;
    const res = fakeRes();
    const next = vi.fn() as unknown as NextFunction;

    await listTermsAdminHandler(req, res, next);

    expect(termService.listTerms).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('term updates', () => {
  it('passes the authenticated actor so the review stamp can be saved', async () => {
    const req = {
      params: { key: 'left_ventricle' },
      body: { status: 'verified' },
      user: { id: 'doc1', role: 'doctor_reviewer' },
    } as unknown as Request;
    const res = fakeRes();
    const next = vi.fn() as unknown as NextFunction;

    await updateTermHandler(req, res, next);

    expect(termService.updateTerm).toHaveBeenCalledWith(
      'left_ventricle',
      { status: 'verified' },
      { id: 'doc1', role: 'doctor_reviewer' },
    );
    expect(next).not.toHaveBeenCalled();
  });
});
