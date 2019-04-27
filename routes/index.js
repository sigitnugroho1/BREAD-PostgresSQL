var express = require('express');
var router = express.Router();
var moment = require('moment')

module.exports = (db) => {

  /* GET home page. */
  router.get('/', (req, res, next) => {
    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;
    const url = req.url == '/' ? '/?page=1' : req.url

    let filter = [];
    let flag = false;

    if (req.query.checkid && req.query.formid) {
      filter.push(`id = ${req.query.formid}`)
      flag = true
    }
    if (req.query.checkstring && req.query.formstring) {
      filter.push(`string = '${req.query.formstring}'`)
      flag = true
    }
    if (req.query.checkinteger && req.query.forminteger) {
      filter.push(`integer = '${req.query.forminteger}'`)
      flag = true
    }
    if (req.query.checkfloat && req.query.formfloat) {
      filter.push(`float = '${req.query.formfloat}'`)
      flag = true
    }
    if (req.query.checkdate && req.query.formsdate && req.query.formedate) {
      filter.push(`date between '${req.query.formsdate}' AND '${req.query.formedate}'`)
      flag = true
    }
    if (req.query.checkboolean && req.query.formboolean) {
      filter.push(`boolean like '${req.query.formboolean}'`)
      flag = true
    }


    let sql = `select count(*) as total from paket`
    if (flag) {
      sql += ` where ${filter.join(' AND ')}`
    }
    console.log(sql);

    db.query(sql, (err, count) => {
      const total = count.rows[0].total;
      const pages = Math.ceil(total / limit)
      sql = `select * from paket`
      // console.log(count);
      // console.log(sql);

      if (flag) {
        sql += ` where ${filter.join(' AND ')}`
      }
      sql += ` limit ${limit} offset ${offset}`

      db.query(sql, (err, response) => {
        // console.log(response.rows)
        res.render('index', {       // setiap kondisi yang mau ditampilkan harus dilempar disini
          data: response.rows,
          page,
          pages,
          query: req.query,      //  querynya harus dibalikin ketika filter
          url,
          moment
        });
      });
    });
  });



  router.get('/add', (req, res) => {
    res.render('add')
  })

  router.post('/add', (req, res) => {
    db.query(`INSERT INTO paket(string,integer,float,date,boolean) VALUES('${req.body.string}','${req.body.integer}','${req.body.float}','${req.body.date}','${req.body.boolean}')`, (err) => {
      console.log(typeof boolean);

      // console.log(req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean);
      res.redirect('/')
    })
  })


  router.get('/edit/:id', (req, res) => {
    let id = req.params.id
    db.query(`SELECT * FROM paket WHERE id = '${id}'`, (err, response) => {
      res.render('edit', {
        item: response.rows[0],
        id: id,
        moment
      })
      // console.log(response.rows[0]);
    })
  })


  router.post('/edit/:id', (req, res) => {
    let id = req.params.id
    let sql = `UPDATE paket SET string = '${req.body.string}',integer = ${req.body.integer}, float = ${req.body.float}, date = '${req.body.date}',boolean = '${req.body.boolean}' WHERE id = ${id}`
    db.query(sql, (err) => {


      res.redirect('/')
    })
  })


  router.get('/delete/:id', (req, res) => {
    let id = req.params.id
    db.query(`delete from paket where id = '${id}'`, req.body.id, (err) => {
      res.redirect('/')
    })
  })




  return router;
}
