import { Request } from 'express';
import { Aggregate, isValidObjectId, PipelineStage, Types } from 'mongoose';
import { ParsedQs } from 'qs';
import { Languages } from '../constants/languages.js';

const fixQuerySpecialValues = (queryObject: { [key: string]: any }) => {
  Object.keys(queryObject).forEach((key) => {
    const value = queryObject[key];

    // If it's a boolean string, convert it into a boolean
    if (value === 'false' || value === 'true') {
      if (value === 'false') queryObject[key] = false;
      if (value === 'true') queryObject[key] = true;
      return;
    }

    // Transform the string into a MongoDB ObjectId to allow filtering using IDs
    if (isValidObjectId(value)) {
      queryObject[key] = new Types.ObjectId(value);
      return;
    }

    // If the value is a number transform it into a number, else keep it as it is
    if (!isNaN(parseFloat(value))) {
      queryObject[key] = parseFloat(value);
      return;
    }

    // If the value is a date string, keep it as it is and don't convert it into a number
    if (!isNaN(new Date(value).getTime())) {
      queryObject[key] = new Date(value);
      return;
    }
  });
};

const handleSpecialValue = (value: string) => {
  // If it's a boolean string, convert it into a boolean
  if (value === 'false' || value === 'true') {
    if (value === 'false') return false;
    if (value === 'true') return true;
  }

  // Transform the string into a MongoDB ObjectId to allow filtering using IDs
  if (isValidObjectId(value)) {
    return new Types.ObjectId(value);
  }

  // If the value is a number transform it into a number, else keep it as it is
  if (!isNaN(parseFloat(value))) {
    return parseFloat(value);
  }

  // If the value is a date string, keep it as it is and don't convert it into a number
  if (!isNaN(new Date(value).getTime())) {
    return new Date(value);
  }

  return value;
};

/**
 * Class to handle API query features such as filtering, sorting, field limiting, and pagination.
 */
export default class AggregateAPI<R> {
  aggregate: Aggregate<Array<R>>;
  private language?: string;
  private queryString: ParsedQs;

  /**
   * Constructs an instance of the APIFeatures.
   *
   * @param {Aggregate<Array<R>>} aggregate - Mongoose query object.
   */
  constructor(aggregate: Aggregate<Array<R>>, req: Request) {
    this.aggregate = aggregate;
    this.language = req.headers['accept-language'];
    this.queryString = req.query;
  }

  translate(): AggregateAPI<R> {
    // Avoid language filteration if the language cookie is set to anything but the registered langauges
    if (!Object.values(Languages).includes(this.language as Languages)) return this;

    this.aggregate = this.aggregate.unwind('$translations').match({ 'translations.language': this.language });

    return this;
  }

  /**
   * Paginates the query results based on the provided page and limit.
   *
   * @returns {AggregateAPI<R>} - The current instance of the query.
   */
  paginate(): AggregateAPI<R> {
    const page = +(this.queryString.page as string) || 1;
    const limit = +(this.queryString.limit as string) || 12;
    const skip = (page - 1) * limit;

    this.aggregate = this.aggregate.skip(skip).limit(limit);

    return this;
  }

  /**
   * Limits the fields returned by the query based on the provided fields.
   *
   * @returns {AggregateAPI<R>} - The current instance of the query.
   */
  project(): AggregateAPI<R> {
    if (this.queryString.fields) {
      let queryStr = this.queryString.fields as string;

      // 'translations>data>name' => translations.data.name
      queryStr = queryStr.replace(/\b>\b/g, '.');

      const fields = queryStr.split(',');
      const projectionFields: { [key: string]: number } = {};
      fields.forEach((field) => {
        if (field.startsWith('-')) {
          const fieldName = field.split('-')[1];
          projectionFields[fieldName] = 0;
        } else {
          projectionFields[field] = 1;
        }
      });

      this.aggregate = this.aggregate.project(projectionFields);
    } else {
      this.aggregate = this.aggregate.project({ __v: 0 });
    }

    return this;
  }

  /**
   * Sorts the query based on the provided sort field(s).
   *
   * @returns {AggregateAPI<R>} - The current instance of the query.
   */
  sort(): AggregateAPI<R> {
    if (this.queryString.sort) {
      let queryStr = this.queryString.sort as string;

      // 'translations>data>name' => translations.data.name
      queryStr = queryStr.replace(/\b>\b/g, '.');

      const fields = queryStr.split(',');
      const sortFields: { [key: string]: 1 | -1 } = {};

      fields.forEach((field) => {
        if (field.startsWith('-')) {
          const fieldName = field.split('-')[1];
          sortFields[fieldName] = -1;
        } else {
          sortFields[field] = 1;
        }
      });

      this.aggregate = this.aggregate.sort(sortFields);
    } else {
      // Sort by the newest by default
      this.aggregate = this.aggregate.sort({ createdAt: -1 });
    }

    return this;
  }

  /**
   * Filters the query based on the provided query string.
   *
   * @returns {AggregateAPI<R>} - The current instance of the query.
   */
  filter(): AggregateAPI<R> {
    const query = structuredClone(this.queryString);
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete query[el]);

    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // 'translations>data>name' => translations.data.name
    queryStr = queryStr.replace(/\b>\b/g, '.');

    const queryObject = JSON.parse(queryStr);

    // Check for each key if the string value contains the `|` character
    Object.keys(queryObject).forEach((key) => {
      if (queryObject[key].includes('|')) {
        // If it has it, that means we need to make an `$or` match, so split the values
        const options: string[] = queryObject[key].split('|');

        // then add an additional match containing the options in an `$or` pipe
        this.aggregate = this.aggregate.match({
          $or: options.map((option) => ({ [queryObject[key]]: handleSpecialValue(option) })),
        });

        // and finally delete the key from the original object since we've already added it
        delete queryObject[key];
      }
    });

    fixQuerySpecialValues(queryObject);

    this.aggregate = this.aggregate.match(queryObject);

    return this;
  }
}

export const translatePipe = (
  req: Request,
  translationsField: string = '$translations',
  matchField: string = 'translations.language'
): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => {
  const language = req.headers['accept-language'];

  // Avoid language filteration if the language cookie is set to anything but the registered langauges
  if (!Object.values(Languages).includes(language as Languages)) return [];

  return [{ $unwind: translationsField }, { $match: { [matchField]: language } }];
};

export const filterPipe = (req: Request): PipelineStage[] => {
  const query = structuredClone(req.query);
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete query[el]);

  let queryStr = JSON.stringify(query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // 'translations>data>name' => translations.data.name
  queryStr = queryStr.replace(/\b>\b/g, '.');

  const queryObject = JSON.parse(queryStr);

  // Check for each key if the string value contains the `|` character
  const pipes: PipelineStage[] = Object.keys(queryObject)
    .map((key) => {
      const value = queryObject[key];

      if (value?.includes('|')) {
        // If it has it, that means we need to make an `$or` match, so split the values
        const options: string[] = value.split('|');

        // then add an additional match containing the options in an `$or` pipe
        const ORPipes = { $match: { $or: options.map((option) => ({ [key]: handleSpecialValue(option) })) } };

        // and finally delete the key from the original object since we've already added it
        delete queryObject[key];

        return ORPipes;
      }
    })
    .filter((pipe) => pipe !== undefined); // Filter out undefined values

  fixQuerySpecialValues(queryObject);

  return [...pipes, { $match: queryObject }];
};

export const sortPipe = (req: Request): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => {
  if (req.query.sort) {
    let queryStr = req.query.sort as string;

    // 'translations>data>name' => translations.data.name
    queryStr = queryStr.replace(/\b>\b/g, '.');

    const fields = queryStr.split(',');
    const sortFields: { [key: string]: 1 | -1 } = {};

    fields.forEach((field) => {
      if (field.startsWith('-')) {
        const fieldName = field.split('-')[1];
        sortFields[fieldName] = -1;
      } else {
        sortFields[field] = 1;
      }
    });
    return [{ $sort: sortFields }];
  } else {
    // Sort by the newest by default

    return [{ $sort: { createdAt: -1 } }];
  }
};

export const projectPipe = (req: Request): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => {
  if (req.query.fields) {
    let queryStr = req.query.fields as string;

    // 'translations>data>name' => translations.data.name
    queryStr = queryStr.replace(/\b>\b/g, '.');

    const fields = queryStr.split(',');
    const projectionFields: { [key: string]: number } = {};
    fields.forEach((field) => {
      if (field.startsWith('-')) {
        const fieldName = field.split('-')[1];
        projectionFields[fieldName] = 0;
      } else {
        projectionFields[field] = 1;
      }
    });

    return [{ $project: projectionFields }];
  } else {
    return [{ $project: { __v: 0 } }];
  }
};

export const paginatePipe = (
  req: Request,
  docsFieldName: string = 'docs'
): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => {
  const queryString = req.query;
  const page = +(queryString.page as string) || 1;
  const limit = +(queryString.limit as string) || 12;
  const skip = (page - 1) * limit;

  return [
    {
      $facet: {
        [docsFieldName]: [{ $skip: skip }, { $limit: limit }],
        totalDocs: [{ $count: 'count' }],
      },
    },
    {
      $set: {
        pagination: {
          total: { $arrayElemAt: ['$totalDocs.count', 0] },
          count: { $size: `$${docsFieldName}` },
          pages: { $ceil: { $divide: [{ $arrayElemAt: ['$totalDocs.count', 0] }, limit] } },
          limit,
          page,
        },
      },
    },
    {
      $project: {
        totalDocs: 0,
      },
    },
  ];
};

export const searchPipe = (
  req: Request,
  searchFields: string[]
): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => {
  const search = req.query.search as string;

  if (!search) return [];

  // Loop over the specified fields and add it to the $or operator to be queried
  // example: { $or: [{ name: { $regex: 'ZED', $option: 'i' } }] }
  const fieldsMatchers = searchFields.map((f) => ({ [f]: { $regex: search, $options: 'i' } }));

  return [{ $match: { $or: fieldsMatchers } }];
};
