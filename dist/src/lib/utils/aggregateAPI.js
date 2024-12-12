"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPipe = exports.paginatePipe = exports.projectPipe = exports.sortPipe = exports.filterPipe = exports.translatePipe = void 0;
const mongoose_1 = require("mongoose");
const languages_js_1 = require("../constants/languages.js");
const fixQuerySpecialValues = (queryObject) => {
    Object.keys(queryObject).forEach((key) => {
        const value = queryObject[key];
        // If it's a boolean string, convert it into a boolean
        if (value === 'false' || value === 'true') {
            if (value === 'false')
                queryObject[key] = false;
            if (value === 'true')
                queryObject[key] = true;
            return;
        }
        // Transform the string into a MongoDB ObjectId to allow filtering using IDs
        if ((0, mongoose_1.isValidObjectId)(value)) {
            queryObject[key] = new mongoose_1.Types.ObjectId(value);
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
const handleSpecialValue = (value) => {
    // If it's a boolean string, convert it into a boolean
    if (value === 'false' || value === 'true') {
        if (value === 'false')
            return false;
        if (value === 'true')
            return true;
    }
    // Transform the string into a MongoDB ObjectId to allow filtering using IDs
    if ((0, mongoose_1.isValidObjectId)(value)) {
        return new mongoose_1.Types.ObjectId(value);
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
class AggregateAPI {
    /**
     * Constructs an instance of the APIFeatures.
     *
     * @param {Aggregate<Array<R>>} aggregate - Mongoose query object.
     */
    constructor(aggregate, req) {
        this.aggregate = aggregate;
        this.language = req.headers['accept-language'];
        this.queryString = req.query;
    }
    translate() {
        // Avoid language filteration if the language cookie is set to anything but the registered langauges
        if (!Object.values(languages_js_1.Languages).includes(this.language))
            return this;
        this.aggregate = this.aggregate.unwind('$translations').match({ 'translations.language': this.language });
        return this;
    }
    /**
     * Paginates the query results based on the provided page and limit.
     *
     * @returns {AggregateAPI<R>} - The current instance of the query.
     */
    paginate() {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 12;
        const skip = (page - 1) * limit;
        this.aggregate = this.aggregate.skip(skip).limit(limit);
        return this;
    }
    /**
     * Limits the fields returned by the query based on the provided fields.
     *
     * @returns {AggregateAPI<R>} - The current instance of the query.
     */
    project() {
        if (this.queryString.fields) {
            let queryStr = this.queryString.fields;
            // 'translations>data>name' => translations.data.name
            queryStr = queryStr.replace(/\b>\b/g, '.');
            const fields = queryStr.split(',');
            const projectionFields = {};
            fields.forEach((field) => {
                if (field.startsWith('-')) {
                    const fieldName = field.split('-')[1];
                    projectionFields[fieldName] = 0;
                }
                else {
                    projectionFields[field] = 1;
                }
            });
            this.aggregate = this.aggregate.project(projectionFields);
        }
        else {
            this.aggregate = this.aggregate.project({ __v: 0 });
        }
        return this;
    }
    /**
     * Sorts the query based on the provided sort field(s).
     *
     * @returns {AggregateAPI<R>} - The current instance of the query.
     */
    sort() {
        if (this.queryString.sort) {
            let queryStr = this.queryString.sort;
            // 'translations>data>name' => translations.data.name
            queryStr = queryStr.replace(/\b>\b/g, '.');
            const fields = queryStr.split(',');
            const sortFields = {};
            fields.forEach((field) => {
                if (field.startsWith('-')) {
                    const fieldName = field.split('-')[1];
                    sortFields[fieldName] = -1;
                }
                else {
                    sortFields[field] = 1;
                }
            });
            this.aggregate = this.aggregate.sort(sortFields);
        }
        else {
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
    filter() {
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
                const options = queryObject[key].split('|');
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
exports.default = AggregateAPI;
const translatePipe = (req, translationsField = '$translations', matchField = 'translations.language') => {
    const language = req.headers['accept-language'];
    // Avoid language filteration if the language cookie is set to anything but the registered langauges
    if (!Object.values(languages_js_1.Languages).includes(language))
        return [];
    return [{ $unwind: translationsField }, { $match: { [matchField]: language } }];
};
exports.translatePipe = translatePipe;
const filterPipe = (req) => {
    const query = structuredClone(req.query);
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete query[el]);
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // 'translations>data>name' => translations.data.name
    queryStr = queryStr.replace(/\b>\b/g, '.');
    const queryObject = JSON.parse(queryStr);
    // Check for each key if the string value contains the `|` character
    const pipes = Object.keys(queryObject)
        .map((key) => {
        const value = queryObject[key];
        if (value === null || value === void 0 ? void 0 : value.includes('|')) {
            // If it has it, that means we need to make an `$or` match, so split the values
            const options = value.split('|');
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
exports.filterPipe = filterPipe;
const sortPipe = (req) => {
    if (req.query.sort) {
        let queryStr = req.query.sort;
        // 'translations>data>name' => translations.data.name
        queryStr = queryStr.replace(/\b>\b/g, '.');
        const fields = queryStr.split(',');
        const sortFields = {};
        fields.forEach((field) => {
            if (field.startsWith('-')) {
                const fieldName = field.split('-')[1];
                sortFields[fieldName] = -1;
            }
            else {
                sortFields[field] = 1;
            }
        });
        return [{ $sort: sortFields }];
    }
    else {
        // Sort by the newest by default
        return [{ $sort: { createdAt: -1 } }];
    }
};
exports.sortPipe = sortPipe;
const projectPipe = (req) => {
    if (req.query.fields) {
        let queryStr = req.query.fields;
        // 'translations>data>name' => translations.data.name
        queryStr = queryStr.replace(/\b>\b/g, '.');
        const fields = queryStr.split(',');
        const projectionFields = {};
        fields.forEach((field) => {
            if (field.startsWith('-')) {
                const fieldName = field.split('-')[1];
                projectionFields[fieldName] = 0;
            }
            else {
                projectionFields[field] = 1;
            }
        });
        return [{ $project: projectionFields }];
    }
    else {
        return [{ $project: { __v: 0 } }];
    }
};
exports.projectPipe = projectPipe;
const paginatePipe = (req, docsFieldName = 'docs') => {
    const queryString = req.query;
    const page = +queryString.page || 1;
    const limit = +queryString.limit || 12;
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
exports.paginatePipe = paginatePipe;
const searchPipe = (req, searchFields) => {
    const search = req.query.search;
    if (!search)
        return [];
    // Loop over the specified fields and add it to the $or operator to be queried
    // example: { $or: [{ name: { $regex: 'ZED', $option: 'i' } }] }
    const fieldsMatchers = searchFields.map((f) => ({ [f]: { $regex: search, $options: 'i' } }));
    return [{ $match: { $or: fieldsMatchers } }];
};
exports.searchPipe = searchPipe;
