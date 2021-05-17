import { BaseHandler } from './base-handler';

export class CommonHelpersGenerator extends BaseHandler {
  constructor() {
    super();

    this.outputs['fake-typeorm.helper.ts'] = this.generateFakeTypeorm();

    this.writeFile('fake-typeorm.helper.ts', 'helpers');
  }

  public generateFiles() {
    this.writeFile('fake-typeorm.helper.ts', 'helpers');
  }

  private generateFakeTypeorm() {
    const output = `export class FakeRepository {\n  public create() {\n    // do nothing\n  }\n  public async save() {\n    // do nothing\n  }\n  public async findOne() {\n    // do nothing\n  }\n  public find() {\n    // do nothing\n  }\n  public async findAndCount() {\n    // do nothing\n  }\n  public async createQueryBuilder() {\n    // do nothing\n  }\n  public async delete() {\n    // do nothing\n  }\n}\n\nexpect class FakeCreateQueryBuilder {  public where() {\n    // do nothing\n  }\n  public async andWhere() {\n    // do nothing\n  }\n  public async orderBy() {\n    // do nothing\n  }\n  public async skip() {\n    // do nothing\n  }\n  public async take() {\n    // do nothing\n  }\n  public async leftJoinAndSelect() {\n    // do nothing\n  }\n  public async joinAndSelect() {\n    // do nothing\n  }\n  public async rightJoinAndSelect() {\n    // do nothing\n  }\n  public async getMany() {\n    // do nothing\n  }\n  public async getManyAndCount() {\n    // do nothing\n  }\n}\n`;

    return output;
  }
}
