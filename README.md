模糊搜索
_.or({
      'activity.$[].title': db.RegExp({
        regexp: '.*' + keyword,
        options: 'i',
      })
    }
    )
