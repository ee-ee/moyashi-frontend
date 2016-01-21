(function () {
'use strict';

var baseurl = 'http://sfc.euamo.moe/';

var BoardList = {
    boards: m.prop(false),
    list: function() {
        return m.request({method: "GET", url: "/boards.json"});
    },
    controller: function() {
        if(!BoardList.boards()) {
            BoardList.boards = BoardList.list();
        }
    },
    getTitle: function(slug) {
        if(BoardList.boards()) {
            var name = BoardList.boards().filter(function(val, index, array) {
                return val.slug === slug;
            })[0].name;
            return name;
        } else {
            return false;
        }
    },
    view: function() {
        return m("ul.boardlist", [
                m("li", m("a", {config:m.route, href: '/'}, 'Home')),
                BoardList.boards().map(function(board) {
                    return m("li", m("a", {config:m.route, href: '/' + board.slug + '/'}, '/' + board.slug + '/'));
                }),
            ]);
    }
};

var Board = {
    currentBoard: m.prop(),
    currentBoardTitle: m.prop(),
    threadId: m.prop(),
    controller: function() {
        Board.currentBoard = m.route.param('boardName');
        Board.threadId = m.route.param('threadId');
        var threads = Board.listThreads(Board.currentBoard);
        return {
            threads: threads,
        };
    },
    listThreads: function(currentBoard) {
        var url = baseurl + currentBoard;
        if(Board.threadId) {
            url = url + '/res/' + Board.threadId + '.json';
        } else {
            url = url + '/0.json';
        }
        return m.request({method: 'GET', url: url});
    },
    view: function(ctrl) {
        if(Board.threadId) {
            return [
                m.component(BoardList),
                m.component(Title),
                m.component(SingleThread, {threads: ctrl.threads})
            ];
        } else {
            return [
                m.component(BoardList),
                m.component(Title),
                m.component(ThreadList, {threads: ctrl.threads})
            ];
        }
    }
};

var Title = {
    view: function(ctrl) {
        var title = BoardList.getTitle(Board.currentBoard);
        return m("h1", '/' + Board.currentBoard + '/ - ' + title);
    }
};

var ThreadList = {
    view: function(ctrl, args) {
        return m("div.threads", [
            args.threads().threads.map(function(thread) {
                return m.component(Thread, {thread: thread, single: false});
            })
        ]);
    }
};

var SingleThread = {
    view: function(ctrl, args) {
        return m("div.threads", m.component(Thread, {thread: args.threads(), single: true}));
    }
};

var Thread = {
    single: m.prop(),
    firstPost : m.prop(true),
    controller: function(args) {
        Thread.single = args.single;
    },
    view: function(ctrl, args) {
        Thread.firstPost = true;
        return m("div.thread", this.printThread(args.thread));
    },
    printThread: function(thread) {
        return [
            m("hr"),
            thread.posts.map(Thread.printPost)
        ];
    },
    printPost: function(post) {
        var postDiv = 'div.post';
        if(Thread.firstPost === false) {
            postDiv = postDiv + '.reply';
        }

        var omitted = "";
        if(post.omitted_posts && post.omitted_posts !== "0") {
            var omittedText = post.omitted_posts + " posts";
            if(post.omitted_images !== "0") {
                omittedText = omittedText + " e " + post.omitted_images + " imagens";
            }
            omittedText = omittedText + " omitidos";

            omitted = m("p.omitted", omittedText);
        }

        var goback = "";
        var viewthread = "";
        if(Thread.firstPost) {
            if(Thread.single === false) {
                viewthread = m("a", {config:m.route, href: '/' + Board.currentBoard + '/' + post.no, class:'viewthread'}, 'Ver Thread »');
            } else {
                goback = m("a", {config:m.route, href: '/' + Board.currentBoard + '/', class:'return'}, '« Retornar');
            }
        }

        var image = '';
        if(post.filename) {
            image = m('a.image',
                  {
                    href: baseurl + Board.currentBoard + '/src/' + post.tim + post.ext,
                    target: '_blank'
                  },
                  m("img",
                    {
                        src: baseurl + Board.currentBoard + '/thumb/' + post.tim + '.png',
                        width: post.tn_w,
                        height: post.tn_h
                    }
                  )
                );
        }
        var datetime = new Date(parseInt(post.time + '000'));
        var month = datetime.getMonth() + 1;
        var timestamp = datetime.getDate() + '/' + month + '/' + datetime.getFullYear() + ' ' + datetime.getHours() + ':' + datetime.getMinutes();

        var body = '';
        if(post.com) {
            body = m.trust(post.com);
        }

        Thread.firstPost = false;

        return m(postDiv, [
                goback,
                m("p.intro", [
                    m("span.name", post.name),
                    m("time", timestamp),
                ]),
                m('div.files', image),
                m('p.body', body),
                omitted,
                viewthread
        ]);
    }
};

var Home = {
    view: function() {
        return [
            m.component(BoardList),
            m('h1', 'Moyashi Front-End')
        ];
    }
};

m.route.mode = 'pathname';
m.route(document.body, '/', {
    '/': Home,
    '/:boardName/:threadId': Board,
    '/:boardName': Board,
});

}()); // strict function
