const React = require('react'),
      ReactDOM = require('react-dom'),
      createStore = require('redux').createStore;

function reducer(state = { currentPage: 1 }, action) {
  switch (action.type) {
    case 'SWITCH_PAGE':
        console.log(action);
        return Object.assign({}, state, { currentPage: action.page });
    default:
      return state;
  }
}

let store = createStore(reducer);

let Search = React.createClass({
  render: function() {
    return (
      <section className="search">
        <SearchMain />
      </section>
    );
  }
});

let SearchMain = React.createClass({
  getInitialState: () => {
    return {
      //searchTerm: 'benders',
      currentPage: store.getState().currentPage
    };
  },
  componentDidMount: function() {
    this.callAPI(this.state.searchTerm);
  },
  callAPI: function(searchTerm, getResults) {
    console.log(store.getState().currentPage);
    let justCount = 1;
    let limit = 1000;
    const resultsShown = 2;
    if (getResults) {
      justCount = 0;
      limit = resultsShown;
    }
    if (searchTerm) {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const response = JSON.parse(xhr.response);
          const count = response.count
          if (justCount && count) {
            this.setState({
              count: count,
              maxPage: Math.ceil(count / resultsShown)
            });
            this.callAPI(searchTerm, true);
          } else if (!justCount) {
            this.setState({ data: response });
          }
        }
      }
      xhr.open('GET', `http://api.vip.supplyhub.com:19000/products?search=${searchTerm}&count=${justCount}&limit=${limit}`);
      xhr.send(null);
    }
  },
  handleInput: function(e) {
    this.setState({ searchTerm: e.target.value });
    this.callAPI(e.target.value);
  },
  render: function() {
    return (
      <div>Search:&nbsp;
        <input
          type="text" ref="search-input" placeholder="Enter something!"
          value={this.state.searchTerm} onChange={this.handleInput} />
        <SearchResultsCounter count={this.state.count} />
        <SearchResultGrid data={this.state.data}></SearchResultGrid>
        <SearchPagination currentPage={this.state.currentPage} maxPage={this.state.maxPage} />
      </div>
    );
  }
});

let SearchResultsCounter = React.createClass({
  render: function() {
    const resultText = (this.props.count || 'No') + ' results found.';
    return (
      <p>{resultText}</p>
    );
  }
});

let SearchResultGrid = React.createClass({
  render: function() {
    const results = this.props.data || [];
    const data = results.map(function(result) {
      return (
        <div key={result.product.slug}>
          <SearchResult data={result} />
          <hr/>
        </div>
      );
    });
    return (
      <div>{data}</div>
    );
  }
});

let SearchResult = React.createClass({
  render: function() {
    const data = this.props.data;
    const thumbnail = data.product.thumbnail || 'http://vip.supplyhub.com/assets/images/no-product-image.svg';
    const description = data.product.fulltechDesc ? 'Description: ' + data.product.fulltechDesc : '';
    return (
      <div>
        <h1>{data.product.name}</h1>
        by {data.brand.name}<br/>
        <img src={thumbnail} />
        <h3>Category: {data.category.name}</h3>
        <h3>UPC: {data.product.upc}</h3>
        <p>{description}</p>
      </div>
    );
  }
});

let SearchPagination = React.createClass({
  render: function() {
    let style = {
      cursor: 'pointer',
      color: 'pink'
    };
    let currentPage = this.props.currentPage;
    let maxPage = this.props.maxPage || currentPage;
    let pages = (() => {
      if (maxPage > 1) {
        let p = []
        for(let i = currentPage; i <= maxPage; ++i) {
          p.push(i);
        }
        return p.map(function(page) {
          let paginate = function() {
            store.dispatch({type:'SWITCH_PAGE', page: page});
          };
          if (page !== currentPage) {
            return (
              <a style={style} onClick={paginate} key={page}>{page} </a>
            );
          } else {
            return (
              <span key={page}>{page} </span>
            );
          }
        });
      } else {
        return null;
      }
    })();
    return (
      <div>{pages}</div>
    );
  }
});

ReactDOM.render(<Search />, document.getElementById('search'));
