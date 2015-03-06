/*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */


/// <reference path="../../../../../externs/ts/jasmine.d.ts"/>
import formats = require('../app/notebooks/serializers/formats');
import ipy = require('../app/notebooks/serializers/ipynb');


describe('Parse .ipynb format to in-memory notebook model', () => {
  var ipynb: app.ipy.Notebook;
  var ipynbSerialized: string;
  var notebook: app.notebook.Notebook;
  var serializer: app.INotebookSerializer;

  beforeEach(() => {
    serializer = new ipy.IPySerializer();
    ipynb = {
      "metadata": {
        "name": "",
        "signature": "sha256:hash-value-goes-here"
       },
       "nbformat": 3,
       "nbformat_minor": 0,
       "worksheets": [
        {
         "cells": [
          {
           "cell_type": "code",
           "collapsed": false,
           "input": [
            "1 + 3"
           ],
           "language": "python",
           "metadata": {},
           "outputs": [
            {
             "metadata": {},
             "output_type": "pyout",
             "prompt_number": 1,
             "text": [
              "4"
             ]
            }
           ],
           "prompt_number": 1
          }
         ],
         "metadata": {}
        }
       ]
    };
    ipynbSerialized = JSON.stringify(ipynb, null, 2)
  });

  afterEach(() => {
    ipynb = undefined;
    ipynbSerialized = undefined;
    notebook = undefined;
    serializer = undefined;
  });

  it('should generate a .ipynb formatted JSON string', () => {
    console.log('parsed: ', JSON.stringify(serializer.parse(ipynbSerialized, formats.names.ipynbV3), null, 2));
  });

});


describe('Serialize in-memory notebook model to .ipynb format', () => {
  var ipynb: app.ipy.Notebook;
  var ipynbSerialized: string;
  var notebook: app.notebook.Notebook;
  var serializer: app.INotebookSerializer;

  beforeEach(() => {
    serializer = new ipy.IPySerializer();
    notebook = {
      "id": "f59535f7-02d0-4958-b051-089694d56fed",
      "metadata": {
        "name": "",
        "signature": "sha256:hash-value-goes-here"
      },
      "worksheetIds": [
        "c34cb974-49d3-45e1-90fc-d393ec4882dd"
      ],
      "worksheets": {
        "c34cb974-49d3-45e1-90fc-d393ec4882dd": {
          "id": "c34cb974-49d3-45e1-90fc-d393ec4882dd",
          "name": "Untitled Worksheet",
          "metadata": {},
          "cells": [
            {
              "id": "e7a32977-bc05-48b5-963d-35919a846bdd",
              "metadata": {
                "language": "python"
              },
              "type": "code",
              "source": "1 + 3",
              "prompt": "1",
              "outputs": [
                {
                  "type": "result",
                  "mimetypeBundle": {
                    "text/plain": "4"
                  }
                }
              ]
            }
          ]
        }
      }
    };
  });

  afterEach(() => {
    ipynb = undefined;
    notebook = undefined;
    serializer = undefined;
  });

  it('should generate a .ipynb formatted JSON string', () => {
    ipynbSerialized = serializer.stringify(notebook, formats.names.ipynbV3);
    console.log('generated: ', ipynbSerialized);
    // The exact string is probably fragile to compare against because insignificant,
    // so parse it back into an object and compare the data contained within
    ipynb = JSON.parse(ipynbSerialized);
    // Expected ipynb data:
    //
    // {
    //   "nbformat": 3,
    //   "nbformat_minor": 0,
    //   "metadata": {
    //     "name": "",
    //   },
    //   "worksheets": [
    //     {
    //       "metadata": {},
    //       "cells": [
    //         {
    //           "cell_type": "code",
    //           "input": [
    //             "1 + 3"
    //           ],
    //           "collapsed": false,
    //           "metadata": {},
    //           "language": "python",
    //           "prompt_number": 1,
    //           "outputs": [
    //             {
    //               "output_type": "display_data",
    //               "metadata": {},
    //               "text": [
    //                 "4"
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // }
    expect(ipynb.nbformat).toBe(3);
    expect(ipynb.nbformat_minor).toBe(0);
    expect(ipynb.metadata).toEqual({
      name: ''
      // The signature field should have been removed
      // Note: signature has been removed from the ipynb v4 format
    });
    expect(ipynb.worksheets.length).toBe(1);

    var worksheet = ipynb.worksheets[0];
    expect(worksheet.metadata).toEqual({});
    expect(worksheet.cells.length).toBe(1);

    var cell = <app.ipy.CodeCell>worksheet.cells[0];
    expect(cell.cell_type).toBe('code');
    expect(cell.input).toEqual(['1 + 3']);
    expect(cell.collapsed).toBe(false);
    expect(cell.metadata).toEqual({});
    expect(cell.language).toBe('python');
    expect(cell.prompt_number).toBe(1);
    expect(cell.outputs.length).toBe(1);

    var output = <app.ipy.DisplayDataOutput>cell.outputs[0];
    expect(output.metadata).toEqual({});
    expect(output.output_type).toBe('display_data');
    expect(output.text).toEqual(['4']);
  });

});