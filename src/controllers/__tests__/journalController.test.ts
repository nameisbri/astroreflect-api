import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import {
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry,
  getEntries,
  getRecentEntries,
  getEntriesForTransit,
} from "../journalController";
import * as journalService from "../../services/journal/journalService";

// Mock the journal service
vi.mock("../../services/journal/journalService");

describe("Journal Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockJsonFn = vi.fn();
  const mockStatusFn = vi.fn(() => ({ json: mockJsonFn }));

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: mockStatusFn,
      json: mockJsonFn,
    };
    vi.clearAllMocks();
  });

  describe("createEntry", () => {
    it("should create a journal entry successfully", async () => {
      // Mock request body
      mockRequest.body = {
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test journal entry content",
        mood: "Reflective",
        tags: ["test", "journal"],
      };

      // Mock service response
      const mockEntry = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test journal entry content",
        mood: "Reflective",
        tags: ["test", "journal"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(journalService.createJournalEntry).mockResolvedValue(mockEntry);

      // Call the controller
      await createEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.createJournalEntry).toHaveBeenCalledWith({
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test journal entry content",
        mood: "Reflective",
        tags: ["test", "journal"],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        data: mockEntry,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      // Mock request with missing fields
      mockRequest.body = {
        content: "Test content without transitId",
      };

      // Call the controller
      await createEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.createJournalEntry).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Transit ID and content are required",
        })
      );
    });

    it("should return 500 if service throws an error", async () => {
      // Mock request body
      mockRequest.body = {
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test journal entry content",
      };

      // Mock service error
      const error = new Error("Database error");
      vi.mocked(journalService.createJournalEntry).mockRejectedValue(error);

      // Call the controller
      await createEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.createJournalEntry).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Failed to create journal entry",
        })
      );
    });
  });

  describe("getEntry", () => {
    it("should return a journal entry by ID", async () => {
      // Mock request params
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174001",
      };

      // Mock service response
      const mockEntry = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test journal entry content",
        mood: "Reflective",
        tags: ["test", "journal"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(journalService.getJournalEntryById).mockResolvedValue(
        mockEntry
      );

      // Call the controller
      await getEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getJournalEntryById).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174001"
      );
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        data: mockEntry,
      });
    });

    it("should return 404 if entry not found", async () => {
      // Mock request params
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174999",
      };

      // Mock service response for not found
      vi.mocked(journalService.getJournalEntryById).mockResolvedValue(null);

      // Call the controller
      await getEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getJournalEntryById).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174999"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Journal entry not found",
        })
      );
    });
  });

  describe("updateEntry", () => {
    it("should update a journal entry successfully", async () => {
      // Mock request
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174001",
      };
      mockRequest.body = {
        content: "Updated content",
        mood: "Happy",
      };

      // Mock service response
      const mockUpdatedEntry = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        content: "Updated content",
        mood: "Happy",
        tags: ["test", "journal"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(journalService.updateJournalEntry).mockResolvedValue(
        mockUpdatedEntry
      );

      // Call the controller
      await updateEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.updateJournalEntry).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174001",
        {
          content: "Updated content",
          mood: "Happy",
        }
      );
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedEntry,
      });
    });

    it("should return 400 if no update fields are provided", async () => {
      // Mock request with empty body
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174001",
      };
      mockRequest.body = {};

      // Call the controller
      await updateEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.updateJournalEntry).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "No update fields provided",
        })
      );
    });

    it("should return 404 if entry not found during update", async () => {
      // Mock request
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174999",
      };
      mockRequest.body = {
        content: "Updated content",
      };

      // Mock service error for not found
      const error = new Error("Journal entry not found");
      vi.mocked(journalService.updateJournalEntry).mockRejectedValue(error);

      // Call the controller
      await updateEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.updateJournalEntry).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Failed to update journal entry",
        })
      );
    });
  });

  describe("deleteEntry", () => {
    it("should delete a journal entry successfully", async () => {
      // Mock request params
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174001",
      };

      // Mock service response
      vi.mocked(journalService.deleteJournalEntry).mockResolvedValue(true);

      // Call the controller
      await deleteEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.deleteJournalEntry).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174001"
      );
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        message: "Journal entry deleted successfully",
      });
    });

    it("should return 404 if entry not found during delete", async () => {
      // Mock request params
      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174999",
      };

      // Mock service response for not found
      vi.mocked(journalService.deleteJournalEntry).mockResolvedValue(false);

      // Call the controller
      await deleteEntry(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.deleteJournalEntry).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174999"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Journal entry not found",
        })
      );
    });
  });

  describe("getEntries", () => {
    it("should return all journal entries when no filters provided", async () => {
      // Mock request query
      mockRequest.query = {};

      // Mock service response
      const mockEntries = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Test journal entry 1",
          tags: ["test"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Test journal entry 2",
          mood: "Happy",
          tags: ["test", "happy"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(journalService.getJournalEntries).mockResolvedValue(
        mockEntries
      );

      // Call the controller
      await getEntries(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getJournalEntries).toHaveBeenCalledWith({});
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEntries,
      });
    });

    it("should apply filters when provided", async () => {
      // Mock request query with filters
      mockRequest.query = {
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        tags: "happy,test",
        limit: "10",
      };

      // Mock service response
      const mockEntries = [
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Test journal entry 2",
          mood: "Happy",
          tags: ["test", "happy"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(journalService.getJournalEntries).mockResolvedValue(
        mockEntries
      );

      // Call the controller
      await getEntries(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getJournalEntries).toHaveBeenCalledWith({
        transitId: "123e4567-e89b-12d3-a456-426614174000",
        tags: ["happy", "test"],
        limit: 10,
      });
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockEntries,
      });
    });

    it("should return 400 for invalid date format", async () => {
      // Mock request query with invalid date
      mockRequest.query = {
        startDate: "invalid-date",
      };

      // Call the controller
      await getEntries(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getJournalEntries).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Invalid startDate format",
        })
      );
    });
  });

  describe("getRecentEntries", () => {
    it("should return recent journal entries with default limit", async () => {
      // Mock request query
      mockRequest.query = {};

      // Mock service response
      const mockEntries = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Recent entry 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Recent entry 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(journalService.getRecentJournalEntries).mockResolvedValue(
        mockEntries
      );

      // Call the controller
      await getRecentEntries(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getRecentJournalEntries).toHaveBeenCalledWith(5);
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEntries,
      });
    });

    it("should use custom limit when provided", async () => {
      // Mock request query with custom limit
      mockRequest.query = {
        limit: "3",
      };

      // Mock service response
      const mockEntries = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Recent entry 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Recent entry 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174003",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Recent entry 3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(journalService.getRecentJournalEntries).mockResolvedValue(
        mockEntries
      );

      // Call the controller
      await getRecentEntries(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getRecentJournalEntries).toHaveBeenCalledWith(3);
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        count: 3,
        data: mockEntries,
      });
    });

    it("should return 400 for invalid limit", async () => {
      // Mock request query with invalid limit
      mockRequest.query = {
        limit: "invalid",
      };

      // Call the controller
      await getRecentEntries(mockRequest as Request, mockResponse as Response);

      // Assertions
      expect(journalService.getRecentJournalEntries).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Invalid limit parameter",
        })
      );
    });
  });

  describe("getEntriesForTransit", () => {
    it("should return journal entries for a specific transit", async () => {
      // Mock request params
      mockRequest.params = {
        transitId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // Mock service response
      const mockEntries = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Transit entry 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          transitId: "123e4567-e89b-12d3-a456-426614174000",
          content: "Transit entry 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(journalService.getJournalEntriesForTransit).mockResolvedValue(
        mockEntries
      );

      // Call the controller
      await getEntriesForTransit(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assertions
      expect(journalService.getJournalEntriesForTransit).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(mockJsonFn).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEntries,
      });
    });

    it("should return 400 if transit ID is missing", async () => {
      // Mock request with missing transit ID
      mockRequest.params = {};

      // Call the controller
      await getEntriesForTransit(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assertions
      expect(journalService.getJournalEntriesForTransit).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Transit ID is required",
        })
      );
    });
  });
});
