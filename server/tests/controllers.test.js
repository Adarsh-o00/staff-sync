const employeeController = require('../src/controllers/employeeController');
const attendanceController = require('../src/controllers/attendanceController');
const leaveController = require('../src/controllers/leaveController');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const LeaveRequest = require('../src/models/LeaveRequest');
const app = require('../server');

describe('StaffSync Controllers & Endpoints Unit Test Suite', () => {

  // ==========================================
  // 1. HEALTH CHECK ENDPOINT
  // ==========================================
  describe('Health Check API', () => {
    it('should return health status with ok and database state', (done) => {
      const req = { method: 'GET', url: '/api/health', headers: {} };
      const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        setHeader() { return this; },
        json(data) {
          expect(data).toHaveProperty('status', 'ok');
          expect(data).toHaveProperty('timestamp');
          expect(data).toHaveProperty('database');
          done();
        }
      };
      app.handle(req, res);
    });
  });

  // ==========================================
  // 2. EMPLOYEE CONTROLLER
  // ==========================================
  describe('Employee Controller', () => {
    it('getEmployeeStats should calculate total, active, inactive, and breakdown', async () => {
      const originalCount = User.countDocuments;
      const originalAggregate = User.aggregate;

      User.countDocuments = jest.fn().mockImplementation((query) => {
        if (query && query.isActive === true) return Promise.resolve(15);
        if (query && query.isActive === false) return Promise.resolve(3);
        return Promise.resolve(18);
      });

      User.aggregate = jest.fn().mockImplementation((pipeline) => {
        const groupField = pipeline[1]?.$group?._id;
        if (groupField === '$department') {
          return Promise.resolve([
            { department: 'Engineering', count: 10 },
            { department: 'Management', count: 5 }
          ]);
        }
        return Promise.resolve([
          { role: 'employee', count: 12 },
          { role: 'manager', count: 4 },
          { role: 'admin', count: 2 }
        ]);
      });

      const req = { user: { role: 'admin' }, query: {} };
      let result;
      const res = { json: (d) => { result = d; } };

      await employeeController.getEmployeeStats(req, res);

      expect(result.total).toBe(18);
      expect(result.active).toBe(15);
      expect(result.inactive).toBe(3);
      expect(result.byDepartment).toHaveLength(2);
      expect(result.byRole).toHaveLength(3);

      User.countDocuments = originalCount;
      User.aggregate = originalAggregate;
    });

    it('getEmployees should construct regex search query and filters', async () => {
      const originalFind = User.find;
      let capturedQuery;

      User.find = jest.fn().mockImplementation((q) => {
        capturedQuery = q;
        return {
          select: () => ({
            sort: () => Promise.resolve([
              { _id: '1', name: 'John Doe', email: 'john@staffsync.com', department: 'Engineering' }
            ])
          })
        };
      });

      const req = {
        query: {
          search: 'john',
          department: 'Engineering',
          role: 'employee'
        }
      };
      let result;
      const res = { json: (d) => { result = d; } };

      await employeeController.getEmployees(req, res);

      expect(capturedQuery.department).toBe('Engineering');
      expect(capturedQuery.role).toBe('employee');
      expect(capturedQuery.$or).toBeDefined();
      expect(capturedQuery.$or).toHaveLength(4);
      expect(result).toHaveLength(1);

      User.find = originalFind;
    });
  });

  // ==========================================
  // 3. ATTENDANCE CONTROLLER
  // ==========================================
  describe('Attendance Controller', () => {
    it('getTodaySummary should correctly aggregate total clocked in, absent, and average work hours', async () => {
      const originalUserCount = User.countDocuments;
      const originalAttFind = Attendance.find;

      User.countDocuments = jest.fn().mockResolvedValue(10);

      const mockTodayRecords = [
        { clockIn: new Date(), clockOut: new Date(), totalHours: 8.5, status: 'present' },
        { clockIn: new Date(), clockOut: new Date(), totalHours: 7.5, status: 'late' },
        { clockIn: new Date(), clockOut: null, totalHours: 0, status: 'present' }
      ];

      Attendance.find = jest.fn().mockReturnValue({
        populate: () => Promise.resolve(mockTodayRecords)
      });

      const req = { user: { role: 'admin' }, query: {} };
      let summaryResult;
      const res = { json: (d) => { summaryResult = d; } };

      await attendanceController.getTodaySummary(req, res);

      expect(summaryResult.totalEmployees).toBe(10);
      expect(summaryResult.totalClockedIn).toBe(3);
      expect(summaryResult.currentlyClockedIn).toBe(1);
      expect(summaryResult.totalAbsent).toBe(7); // 10 - 3
      expect(summaryResult.totalLate).toBe(1);
      expect(summaryResult.totalPresent).toBe(2);
      expect(summaryResult.averageWorkHours).toBe(8.0); // (8.5 + 7.5) / 2

      User.countDocuments = originalUserCount;
      Attendance.find = originalAttFind;
    });

    it('clockOut should calculate total duration cleanly in hours', async () => {
      const originalFindOne = Attendance.findOne;
      const originalFindById = Attendance.findById;

      const clockInTime = new Date('2026-10-27T09:00:00Z');
      const mockRecord = {
        _id: 'att1',
        user: 'user1',
        clockIn: clockInTime,
        clockOut: null,
        totalHours: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      Attendance.findOne = jest.fn().mockResolvedValue(mockRecord);
      Attendance.findById = jest.fn().mockReturnValue({
        populate: () => Promise.resolve({
          ...mockRecord,
          clockOut: new Date(),
          totalHours: mockRecord.totalHours
        })
      });

      const req = { user: { _id: 'user1' } };
      let resResult;
      const res = { json: (d) => { resResult = d; } };

      await attendanceController.clockOut(req, res);

      expect(mockRecord.clockOut).toBeDefined();
      expect(mockRecord.totalHours).toBeGreaterThanOrEqual(0);
      expect(mockRecord.save).toHaveBeenCalled();

      Attendance.findOne = originalFindOne;
      Attendance.findById = originalFindById;
    });
  });

  // ==========================================
  // 4. LEAVE CONTROLLER
  // ==========================================
  describe('Leave Controller', () => {
    it('updateLeaveStatus must forbid an employee from approving their own leave request', async () => {
      const originalFindById = LeaveRequest.findById;
      const userId = 'employee_123';

      LeaveRequest.findById = jest.fn().mockResolvedValue({
        _id: 'leave_abc',
        user: userId, // Same as requester
        status: 'pending'
      });

      const req = {
        params: { id: 'leave_abc' },
        user: { _id: userId, role: 'employee' },
        body: { status: 'approved' }
      };

      let statusCode;
      let errorResponse;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (d) => { errorResponse = d; }
      };

      await leaveController.updateLeaveStatus(req, res);

      expect(statusCode).toBe(403);
      expect(errorResponse.message).toMatch(/cannot review or approve their own leave/i);

      LeaveRequest.findById = originalFindById;
    });

    it('updateLeaveStatus must reject invalid status values', async () => {
      const req = {
        params: { id: 'leave_abc' },
        user: { _id: 'manager_123', role: 'manager' },
        body: { status: 'invalid_status' }
      };

      let statusCode;
      let errorResponse;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (d) => { errorResponse = d; }
      };

      await leaveController.updateLeaveStatus(req, res);

      expect(statusCode).toBe(400);
      expect(errorResponse.message).toMatch(/must be approved or rejected/i);
    });

    it('updateLeaveStatus by manager properly records reviewer details and status', async () => {
      const originalFindById = LeaveRequest.findById;
      const requesterId = 'emp_456';
      const managerId = 'mgr_789';

      const mockLeave = {
        _id: 'leave_xyz',
        user: requesterId,
        status: 'pending',
        approver: null,
        comments: '',
        save: jest.fn().mockResolvedValue(true)
      };

      let findCount = 0;
      LeaveRequest.findById = jest.fn().mockImplementation(() => {
        findCount++;
        if (findCount === 1) return Promise.resolve(mockLeave);
        return {
          populate: () => ({
            populate: () => Promise.resolve({
              _id: 'leave_xyz',
              user: { _id: requesterId, name: 'Requester' },
              approver: { _id: managerId, name: 'Manager Bob', role: 'manager' },
              status: mockLeave.status,
              comments: mockLeave.comments
            })
          })
        };
      });

      const req = {
        params: { id: 'leave_xyz' },
        user: { _id: managerId, role: 'manager' },
        body: { status: 'approved', comments: 'Approved, enjoy your time off!' }
      };

      let jsonResult;
      const res = { json: (d) => { jsonResult = d; } };

      await leaveController.updateLeaveStatus(req, res);

      expect(mockLeave.status).toBe('approved');
      expect(mockLeave.approver).toBe(managerId);
      expect(mockLeave.comments).toBe('Approved, enjoy your time off!');
      expect(mockLeave.save).toHaveBeenCalled();
      expect(jsonResult.approver.name).toBe('Manager Bob');

      LeaveRequest.findById = originalFindById;
    });

    it('getLeaveStats should return pending, approved, rejected, and total metrics', async () => {
      const originalCount = LeaveRequest.countDocuments;
      const originalAggregate = LeaveRequest.aggregate;

      LeaveRequest.countDocuments = jest.fn().mockImplementation((query) => {
        if (query.status === 'pending') return Promise.resolve(5);
        if (query.status === 'approved') return Promise.resolve(12);
        if (query.status === 'rejected') return Promise.resolve(3);
        return Promise.resolve(20);
      });

      LeaveRequest.aggregate = jest.fn().mockResolvedValue([
        { type: 'annual', count: 12 },
        { type: 'sick', count: 8 }
      ]);

      const req = { user: { role: 'admin' }, query: {} };
      let statsResult;
      const res = { json: (d) => { statsResult = d; } };

      await leaveController.getLeaveStats(req, res);

      expect(statsResult.pending).toBe(5);
      expect(statsResult.approved).toBe(12);
      expect(statsResult.rejected).toBe(3);
      expect(statsResult.total).toBe(20);
      expect(statsResult.byType).toHaveLength(2);

      LeaveRequest.countDocuments = originalCount;
      LeaveRequest.aggregate = originalAggregate;
    });
  });

});
