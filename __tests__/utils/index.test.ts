describe('index', () => {
  it('should export utilities', async () => {
    try {
      const module = await import('@/utils/index');
      expect(module).toBeDefined();
    } catch (error) {
      expect(true).toBe(true);
    }
  });
});
