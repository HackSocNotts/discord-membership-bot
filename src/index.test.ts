import { hello } from './index';

describe('hello', () => {
  it('should say hello world', () => {
    expect(hello('world')).toStrictEqual('hello world');
  });
});
