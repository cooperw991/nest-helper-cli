import { BaseHandler } from './base-handler';
import { p2, p4 } from '../../utils/pad.util';

export class CommonHelpersGenerator extends BaseHandler {
  constructor() {
    super();

    this.outputs['fake-typeorm.helper.ts'] = this.generateFakeTypeorm();
  }

  public async generateFiles() {
    await this.writeFile('fake-typeorm.helper.ts', 'helpers');
  }

  private generateFakeTypeorm() {
    const output = `export class FakeRepository {\n${p2}public create() {\n${p4}// do nothing\n${p2}}\n${p2}public async save() {\n${p4}// do nothing\n${p2}}\n${p2}public async findOne() {\n${p4}// do nothing\n${p2}}\n${p2}public find() {\n${p4}// do nothing\n${p2}}\n${p2}public async findAndCount() {\n${p4}// do nothing\n${p2}}\n${p2}public async createQueryBuilder() {\n${p4}// do nothing\n${p2}}\n${p2}public async delete() {\n${p4}// do nothing\n${p2}}\n}\n\nexport class FakeCreateQueryBuilder {  public where() {\n${p4}// do nothing\n${p2}}\n${p2}public async andWhere() {\n${p4}// do nothing\n${p2}}\n${p2}public async orderBy() {\n${p4}// do nothing\n${p2}}\n${p2}public async skip() {\n${p4}// do nothing\n${p2}}\n${p2}public async take() {\n${p4}// do nothing\n${p2}}\n${p2}public async leftJoinAndSelect() {\n${p4}// do nothing\n${p2}}\n${p2}public async joinAndSelect() {\n${p4}// do nothing\n${p2}}\n${p2}public async rightJoinAndSelect() {\n${p4}// do nothing\n${p2}}\n${p2}public async getMany() {\n${p4}// do nothing\n${p2}}\n${p2}public async getManyAndCount() {\n${p4}// do nothing\n${p2}}\n}\n`;

    return output;
  }
}
